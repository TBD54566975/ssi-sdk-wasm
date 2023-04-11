//go:build js && wasm

package main

import (
	"syscall/js"

	"time"

	"crypto/ed25519"

	"github.com/TBD54566975/ssi-sdk/credential"
	"github.com/TBD54566975/ssi-sdk/credential/exchange"
	"github.com/TBD54566975/ssi-sdk/crypto"

	"github.com/TBD54566975/ssi-sdk/credential/signing"
	"github.com/TBD54566975/ssi-sdk/did"
	"github.com/goccy/go-json"
	"github.com/mr-tron/base58/base58"
	"github.com/pkg/errors"
)

// createDIDKey
//
// @Summary     Create DID:Key pair
// @Description Generate a DID key pair (using Ed25519) and return a JavaScript object containing the DID document and the private key in Base58 format
// @Success     js.Object "{ didDocument: <object>, privateKeyBase58: <string> }"
// @Error js.Value "An error object with a message describing the error"
func createDIDKey() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		pubKey, privKey, err := crypto.GenerateKeyByKeyType(crypto.Ed25519)
		if err != nil {
			return generateError(err)
		}
		didKey, err := did.CreateDIDKey(crypto.Ed25519, pubKey.(ed25519.PublicKey))
		if err != nil {
			return generateError(err)
		}
		result, err := didKey.Expand()
		if err != nil {
			return generateError(err)
		}

		privKeyBytes, err := crypto.PrivKeyToBytes(privKey)
		if err != nil {
			return generateError(err)
		}
		base58PrivKey := base58.Encode(privKeyBytes)

		resultObj, err := simplifyForJS(result)
		if err != nil {
			return generateError(err)
		}

		// Create a JavaScript object and set its properties using the values from the Go struct
		jsDIDObj := js.Global().Get("Object").New()
		jsDIDObj.Set("didDocument", js.ValueOf(resultObj))
		jsDIDObj.Set("privateKeyBase58", js.ValueOf(string(base58PrivKey)))

		return jsDIDObj
	})
}

// resolveDID
//
// @Summary Resolve a DID
// @Description Resolve a given DID using a set of resolvers (KeyResolver, WebResolver, PKHResolver, and PeerResolver), and return the corresponding DID document as a JavaScript object
// @Param didString string "The DID string to be resolved"
// @Success js.Object "{ <DID document fields> }"
// @Error js.Value "An error object with a message describing the error"
func resolveDID() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 1 {
			return generateError(errors.New("invalid arg count, need did as argument"))
		}

		didString := args[0].String()
		resolvers := []did.Resolution{did.KeyResolver{}, did.WebResolver{}, did.PKHResolver{}, did.PeerResolver{}}
		resolver, err := did.NewResolver(resolvers...)
		if err != nil {
			return generateError(err)
		}

		doc, err := resolver.Resolve(didString)
		if err != nil {
			return generateError(err)
		}

		resultBytes, err := json.Marshal(doc)
		if err != nil {
			return generateError(err)
		}

		var resultObj map[string]any
		err = json.Unmarshal(resultBytes, &resultObj)
		if err != nil {
			return generateError(err)
		}

		return js.ValueOf(resultObj)
	})
}

// createVerifiableCredential
//
// @Summary Create a Verifiable Credential
// @Description Create a Verifiable Credential using the provided issuer DID, the issuer DID private key, and subject JSON string, and return the signed Verifiable Credential as a JavaScript object
// @Param issuerDID string "The issuer's DID string"
// @Param issuerDIDPrivateKey string "The issuer's DID private key in Base58 format"
// @Param subjectJSON string "The subject JSON string containing the subject data"
// @Success js.Object "{ <Verifiable Credential fields> }"
// @Error js.Value "An error object with a message describing the error"
func createVerifiableCredential() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 3 {
			return generateError(errors.New("invalid arg count, usage: createVerifiableCredential(didString,didBase58PrivateKey,subjectJSONString)"))
		}
		keyType := crypto.Ed25519

		issuerDID := args[0].String()
		issuerDIDPrivateKey := args[1].String()
		subjectJSON := args[2].String()
		issuanceDate := time.Now().Format(time.RFC3339)

		subject := map[string]any{}
		json.Unmarshal([]byte(subjectJSON), &subject)

		vcBuilder := credential.NewVerifiableCredentialBuilder()
		if err := vcBuilder.SetIssuer(issuerDID); err != nil {
			return generateError(err)
		}
		if err := vcBuilder.SetIssuanceDate(issuanceDate); err != nil {
			return generateError(err)
		}
		if err := vcBuilder.SetCredentialSubject(subject); err != nil {
			return generateError(err)
		}

		vc, err := vcBuilder.Build()
		if err != nil {
			return generateError(err)
		}

		privateKeyBytes, err := base58.Decode(issuerDIDPrivateKey)
		if err != nil {
			return generateError(err)
		}

		// TODO: add keyType as dynamic arg
		privKeyFromBytes, err := crypto.BytesToPrivKey(privateKeyBytes, keyType)
		if err != nil {
			return generateError(err)
		}

		signer, err := crypto.NewJWTSigner(issuerDID, privKeyFromBytes)
		if err != nil {
			return generateError(err)
		}

		signedVCBytes, err := signing.SignVerifiableCredentialJWT(*signer, *vc)
		if err != nil {
			return generateError(err)
		}

		vcJSON, err := signing.ParseVerifiableCredentialFromJWT(string(signedVCBytes))

		resultObj, err := simplifyForJS(vcJSON)
		if err != nil {
			return generateError(err)
		}

		jsDIDObj := js.Global().Get("Object").New()
		jsDIDObj.Set("vc", js.ValueOf(resultObj))
		jsDIDObj.Set("vcJWT", js.ValueOf(string(signedVCBytes)))

		return js.ValueOf(jsDIDObj)
	})
}

// parseJWTCredential
//
// @Summary Parse JWT Verifiable Credential
// @Description Parse a JWT Verifiable Credential from the provided JWT string, and return the corresponding credential as a JavaScript object
// @Param jwtCredential string "The JWT string representing the Verifiable Credential"
// @Success js.Object "{ <Verifiable Credential fields> }"
// @Error js.Value "An error object with a message describing the error"
func parseJWTCredential() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 1 {
			return generateError(errors.New("invalid arg count, need jwt credential string as argument"))
		}

		cred, err := signing.ParseVerifiableCredentialFromJWT(args[0].String())
		if err != nil {
			return generateError(err)
		}

		// unmarshall into json bytes, then back into a simple struct for converting to js
		credBytes, err := json.Marshal(cred)
		if err != nil {
			return generateError(err)
		}
		var resultObj map[string]interface{}
		json.Unmarshal(credBytes, &resultObj)

		return js.ValueOf(resultObj)
	})
}

// verifyJWTCredential
//
// @Summary Verify JWT Verifiable Credential
// @Description Verify a JWT Verifiable Credential by checking its signature and issuer against the provided DID
// @Param jwtCredential string "The JWT string representing the Verifiable Credential"
// @Param didKey string "DID string to be used for verification"
// @Success js.Value "true" "If the JWT Verifiable Credential is successfully verified"
// @Error js.Value "An error object with a message describing the error"
func verifyJWTCredential() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 2 {
			return generateError(errors.New("invalid arg count, need jwt credential string as argument"))
		}
		keyType := crypto.Ed25519

		vcJWT := args[0].String()
		didKey := args[1].String()

		didDoc, err := did.DIDKey(didKey).Expand()
		if err != nil {
			return generateError(err)
		}

		publicKeyBytes, err := base58.Decode(didDoc.VerificationMethod[0].PublicKeyBase58)
		if err != nil {
			return generateError(err)
		}

		cryptoPubKey, err := crypto.BytesToPubKey(publicKeyBytes, keyType)
		if err != nil {
			return generateError(err)
		}

		cred, err := signing.ParseVerifiableCredentialFromJWT(vcJWT)
		if err != nil {
			return generateError(err)
		}

		// TODO: Get kid from vcJWT?
		verifierKid := cred.Issuer.(string)

		jwtVerifier, err := crypto.NewJWTVerifier(verifierKid, cryptoPubKey)
		if err != nil {
			return generateError(err)
		}

		_, err = signing.VerifyVerifiableCredentialJWT(*jwtVerifier, vcJWT)
		if err != nil {
			return generateError(err)
		}

		return js.ValueOf(true)
	})
}

// createPresentationDefinition
//
// @Summary Create a Presentation Definition
// @Description Create a Presentation Definition from a JSON string input
// @Param presentationDefinitionInputString string "The JSON string representing the Presentation Definition input"
// @Success js.Value "An object with a 'presentationDefinition' property containing the created Presentation Definition"
// @Error js.Value "An error object with a message describing the error"
func createPresentationDefinition() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 1 {
			return generateError(errors.New("invalid arg count, usage: createPresentationDefinition(presentationDefinitionInputString)"))
		}

		presentationDefinitionInputString := args[0].String()

		var presentationDefinition exchange.PresentationDefinition
		err := json.Unmarshal([]byte(presentationDefinitionInputString), &presentationDefinition)
		if err != nil {
			return generateError(err)
		}

		resultObj, err := simplifyForJS(presentationDefinition)
		if err != nil {
			return generateError(err)
		}

		jsObj := js.Global().Get("Object").New()
		jsObj.Set("presentationDefinition", js.ValueOf(resultObj))

		return js.ValueOf(jsObj)
	})
}

// createPresentationRequest
//
// @Summary Create a Presentation Request
// @Description Create a Presentation Request from a JSON string input and signing it with the provided signerDID and signerPrivateKeyBase58
// @Param presentationDefinitionInputString string "The JSON string representing the Presentation Definition input"
// @Param signerDID string "The DID string of the signer"
// @Param signerPrivateKeyBase58 string "The base58 encoded private key of the signer"
// @Param holderDID string "The DID string of the holder"
// @Success js.Value "An object with a 'presentationRequestJWT' property containing the created and signed Presentation Request JWT"
// @Error js.Value "An error object with a message describing the error"
func createPresentationRequest() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 4 {
			return generateError(errors.New("invalid arg count, usage: createPresentationRequest(presentationDefinitionInputString, signerDID, signerPrivateKeyBase58, holderDID)"))
		}
		keyType := crypto.Ed25519

		presentationDefinitionInputString := args[0].String()
		signerDID := args[1].String()
		signerPrivateKeyBase58 := args[2].String()
		holderDID := args[3].String()

		var presentationDefinition exchange.PresentationDefinition
		err := json.Unmarshal([]byte(presentationDefinitionInputString), &presentationDefinition)
		if err != nil {
			return generateError(err)
		}

		privateKeyBytes, err := base58.Decode(signerPrivateKeyBase58)
		if err != nil {
			return generateError(err)
		}

		privKeyFromBytes, err := crypto.BytesToPrivKey(privateKeyBytes, keyType)
		if err != nil {
			return generateError(err)
		}

		signer, err := crypto.NewJWTSigner(signerDID, privKeyFromBytes)
		if err != nil {
			return generateError(err)
		}

		presentationRequestBytes, err := exchange.BuildJWTPresentationRequest(*signer, presentationDefinition, holderDID)
		if err != nil {
			return generateError(err)
		}

		jsObj := js.Global().Get("Object").New()
		jsObj.Set("presentationRequestJWT", js.ValueOf(string(presentationRequestBytes)))

		return js.ValueOf(jsObj)
	})
}

// createPresentationSubmission
//
// @Summary Create a Presentation Submission
// @Description Create a Presentation Submission from a JSON string input and signing it with the provided signerDID and signerPrivateKeyBase58
// @Param presentationDefinitionInputString string "The JSON string representing the Presentation Definition input"
// @Param signerDID string "The DID string of the signer"
// @Param signerPrivateKeyBase58 string "The base58 encoded private key of the signer"
// @Param vcJWT string "The JWT string representing the Verifiable Credential"
// @Success js.Value "An object with a 'presentationSubmissionJWT' property containing the created and signed Presentation Submission JWT"
// @Error js.Value "An error object with a message describing the error"
func createPresentationSubmission() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 4 {
			return generateError(errors.New("invalid arg count, usage: createPresentationSubmission(presentationDefinitionInputString, signerDID, signerPrivateKeyBase58, vcJWT)"))
		}
		keyType := crypto.Ed25519

		presentationDefinitionInputString := args[0].String()
		signerDID := args[1].String()
		signerPrivateKeyBase58 := args[2].String()
		vcJWT := args[3].String()

		var presentationDefinition exchange.PresentationDefinition
		err := json.Unmarshal([]byte(presentationDefinitionInputString), &presentationDefinition)
		if err != nil {
			return generateError(err)
		}

		privateKeyBytes, err := base58.Decode(signerPrivateKeyBase58)
		if err != nil {
			return generateError(err)
		}

		privKeyFromBytes, err := crypto.BytesToPrivKey(privateKeyBytes, keyType)
		if err != nil {
			return generateError(err)
		}

		signer, err := crypto.NewJWTSigner(signerDID, privKeyFromBytes)
		if err != nil {
			return generateError(err)
		}

		vc, err := signing.ParseVerifiableCredentialFromJWT(string(vcJWT))
		if err != nil {
			return generateError(err)
		}

		vcJSONBytes, err := json.Marshal(vc)
		if err != nil {
			return generateError(err)
		}

		presentationClaim := exchange.PresentationClaim{
			TokenJSON:                     StringPtr(string(vcJSONBytes)),
			JWTFormat:                     exchange.JWTVC.Ptr(),
			SignatureAlgorithmOrProofType: string(crypto.EdDSA),
		}

		presentationSubmissionBytes, err := exchange.BuildPresentationSubmission(*signer, presentationDefinition, []exchange.PresentationClaim{presentationClaim}, exchange.JWTVPTarget)
		if err != nil {
			return generateError(err)
		}

		jsObj := js.Global().Get("Object").New()
		jsObj.Set("presentationSubmissionJWT", js.ValueOf(string(presentationSubmissionBytes)))

		return js.ValueOf(jsObj)
	})
}

// verifyPresentationSubmission
//
// @Summary Verify Presentation Submission
// @Description Verify a Presentation Submission by checking its signature and issuer against the provided verifierDID and verifierPrivateKeyBase58
// @Param presentationDefinitionInputString string "The JSON string representing the Presentation Definition input"
// @Param verifierDID string "The DID string of the verifier"
// @Param verifierPrivateKeyBase58 string "The base58 encoded private key of the verifier"
// @Param presentationSubmissionJWT string "The JWT string representing the Presentation Submission"
// @Success js.Value "true" "If the Presentation Submission is successfully verified"
// @Error js.Value "An error object with a message describing the error"
func verifyPresentationSubmission() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		keyType := crypto.Ed25519

		presentationDefinitionInputString := args[0].String()
		verifierDID := args[1].String()
		verifierPrivateKeyBase58 := args[2].String()
		presentationSubmissionJWT := args[3].String()

		var presentationDefinition exchange.PresentationDefinition
		err := json.Unmarshal([]byte(presentationDefinitionInputString), &presentationDefinition)
		if err != nil {
			return generateError(err)
		}

		privateKeyBytes, err := base58.Decode(verifierPrivateKeyBase58)
		if err != nil {
			return generateError(err)
		}

		privKeyFromBytes, err := crypto.BytesToPrivKey(privateKeyBytes, keyType)
		if err != nil {
			return generateError(err)
		}

		signer, err := crypto.NewJWTSigner(verifierDID, privKeyFromBytes)
		if err != nil {
			return generateError(err)
		}

		verifier, err := signer.ToVerifier()
		if err != nil {
			return generateError(err)
		}

		err = exchange.VerifyPresentationSubmission(*verifier, exchange.JWTVPTarget, presentationDefinition, []byte(presentationSubmissionJWT))
		if err != nil {
			return generateError(err)
		}

		return js.ValueOf(true)
	})
}

// generateError - Creates a JavaScript error object and a promise rejection with the provided Go error
func generateError(err error) interface{} {
	jsErr := js.Global().Get("Error").New(err.Error())
	promiseConstructor := js.Global().Get("Promise")
	return promiseConstructor.New(js.FuncOf(func(_ js.Value, resolveAndReject []js.Value) interface{} {
		reject := resolveAndReject[1]
		reject.Invoke(jsErr)
		return nil
	}))
}

// simplifyForJS - Unmarshal into JSON bytes, then back into a simple struct for converting to JS
func simplifyForJS(obj any) (any, error) {
	resultBytes, err := json.Marshal(obj)
	if err != nil {
		return nil, err
	}
	var resultObj map[string]interface{}
	err = json.Unmarshal(resultBytes, &resultObj)
	if err != nil {
		return nil, err
	}
	return resultObj, nil
}

func StringPtr(s string) *string {
	return &s
}

func main() {
	ch := make(chan struct{}, 0)
	js.Global().Set("createDIDKey", createDIDKey())
	js.Global().Set("resolveDid", resolveDID())
	js.Global().Set("parseJWTCredential", parseJWTCredential())
	js.Global().Set("createVerifiableCredential", createVerifiableCredential())
	js.Global().Set("verifyJWTCredential", verifyJWTCredential())
	js.Global().Set("createPresentationDefinition", createPresentationDefinition())
	js.Global().Set("createPresentationSubmission", createPresentationSubmission())
	js.Global().Set("createPresentationRequest", createPresentationRequest())
	js.Global().Set("verifyPresentationSubmission", verifyPresentationSubmission())
	<-ch
}
