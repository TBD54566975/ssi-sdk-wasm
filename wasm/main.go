//go:build js && wasm

package main

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"syscall/js"
	"time"

	"crypto/ed25519"

	"github.com/TBD54566975/ssi-sdk/credential"
	"github.com/TBD54566975/ssi-sdk/credential/exchange"
	"github.com/TBD54566975/ssi-sdk/crypto"
	"github.com/TBD54566975/ssi-sdk/crypto/jwx"
	"github.com/TBD54566975/ssi-sdk/did/ion"
	"github.com/TBD54566975/ssi-sdk/did/key"
	"github.com/TBD54566975/ssi-sdk/did/peer"
	"github.com/TBD54566975/ssi-sdk/did/pkh"
	"github.com/TBD54566975/ssi-sdk/did/resolution"
	"github.com/TBD54566975/ssi-sdk/did/web"
	"github.com/goccy/go-json"
	"github.com/google/uuid"
	"github.com/mr-tron/base58"
	"github.com/pkg/errors"
)

// createDIDKey
//
// @Summary     Create DID:Key pair
// @Description Generate a DID key pair (using Ed25519) and return a JavaScript object containing the DID document and the private JWK
// @Success     js.Object "{ didDocument: <object>, privKeyJWK: <string> }"
// @Error js.Value "An error object with a message describing the error"
func createDIDKey() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		pubKey, privKey, err := crypto.GenerateKeyByKeyType(crypto.Ed25519)
		if err != nil {
			return generateError(err)
		}

		didKey, err := key.CreateDIDKey(crypto.Ed25519, pubKey.(ed25519.PublicKey))
		if err != nil {
			return generateError(err)
		}

		result, err := didKey.Expand()
		if err != nil {
			return generateError(err)
		}

		_, privKeyJWK, err := jwx.PrivateKeyToPrivateKeyJWK(uuid.NewString(), privKey)
		if err != nil {
			return generateError(err)
		}

		privKeyJWKBytes, err := json.Marshal(privKeyJWK)
		if err != nil {
			return generateError(err)
		}

		privKeyJWKString := string(privKeyJWKBytes)

		resultObj, err := simplifyForJS(result)
		if err != nil {
			return generateError(err)
		}

		jsDIDObj := js.Global().Get("Object").New()
		jsDIDObj.Set("didDocument", js.ValueOf(resultObj))
		jsDIDObj.Set("privKeyJWK", js.ValueOf(privKeyJWKString))

		return jsDIDObj
	})
}

// createDIDIon
//
// @Summary     Create DID:Ion pair
// @Description Generate a DID Ion pair (using Ed25519) for ION protocol and return a JavaScript object containing the ION document and the private JWK
// @Success     js.Object "{ didDocument: <object>, privKeyJWK: <string> }"
// @Error js.Value "An error object with a message describing the error"
func createDIDIon() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		_, privKey, err := crypto.GenerateKeyByKeyType(crypto.Ed25519)
		if err != nil {
			return generateError(err)
		}

		pubKeyJWK, privKeyJWK, err := jwx.PrivateKeyToPrivateKeyJWK(uuid.NewString(), privKey)
		if err != nil {
			return generateError(err)
		}

		keyID := uuid.NewString()
		pubKeys := []ion.PublicKey{
			{
				ID:           keyID,
				Type:         crypto.Ed25519.String(),
				PublicKeyJWK: *pubKeyJWK,
				Purposes:     []ion.PublicKeyPurpose{ion.Authentication, ion.AssertionMethod},
			},
		}

		doc := ion.Document{PublicKeys: pubKeys, Services: []ion.Service{}}

		ionDID, _, err := ion.NewIONDID(doc)
		if err != nil {
			return generateError(err)
		}

		resultObj := make(map[string]interface{})
		resultObj["id"] = ionDID.ID()
		resultObj["recoveryPrivateJWK"] = fmt.Sprintf("%v", ionDID.GetRecoveryPrivateKey())
		resultObj["longForm"] = ionDID.LongForm()

		privKeyJWKBytes, err := json.Marshal(privKeyJWK)
		if err != nil {
			return generateError(err)
		}
		privKeyJWKString := string(privKeyJWKBytes)

		jsDIDObj := js.Global().Get("Object").New()
		jsDIDObj.Set("didDocument", js.ValueOf(resultObj))
		jsDIDObj.Set("privKeyJWK", js.ValueOf(privKeyJWKString))

		return js.ValueOf(jsDIDObj)
	})
}

// resolveDID
//
// @Summary Resolve a DID
// @Description Resolve a given DID using a set of resolvers (KeyResolver, WebResolver, PKHResolver, PeerResolver, and IonResolver), and return the corresponding DID document as a JavaScript object
// @Param didString string "The DID string to be resolved"
// @Success js.Object "{ <DID document fields> }"
// @Error js.Value "An error object with a message describing the error"
func resolveDID() js.Func {
	return js.FuncOf(func(this js.Value, topArgs []js.Value) interface{} {
		promiseConstructor := js.Global().Get("Promise")
		return promiseConstructor.New(js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
			resolve := args[0]
			reject := args[1]

			go func() {
				if len(topArgs) != 1 {
					reject.Invoke(generateError(errors.New("invalid arg count, need did as argument")))
					return
				}

				didString := topArgs[0].String()

				var err error
				var doc *resolution.ResolutionResult

				if strings.Contains(didString, "ion:") {
					ionResolver, err := ion.NewIONResolver(http.DefaultClient, "https://ion.tbddev.org/")
					doc, err = ionResolver.Resolve(context.Background(), didString, nil)
					if err != nil {
						reject.Invoke(generateError(err))
					}
				} else {
					resolvers := []resolution.Resolver{key.Resolver{}, web.Resolver{}, pkh.Resolver{}, peer.Resolver{}}
					resolver, err := resolution.NewResolver(resolvers...)
					if err != nil {
						reject.Invoke(generateError(err))
					}
					doc, err = resolver.Resolve(nil, didString)
					if err != nil {
						reject.Invoke(generateError(err))
					}
				}

				resultBytes, err := json.Marshal(doc)
				if err != nil {
					reject.Invoke(generateError(err))
					return
				}

				var resultObj map[string]any
				err = json.Unmarshal(resultBytes, &resultObj)
				if err != nil {
					reject.Invoke(generateError(err))
					return
				}

				resolve.Invoke(js.ValueOf(resultObj))
			}()

			return nil
		}))
	})
}

// createVerifiableCredential
//
// @Summary Create a Verifiable Credential
// @Description Create a Verifiable Credential using the provided issuer DID, the issuer DID private key, and subject JSON string, and return the signed Verifiable Credential as a JavaScript object
// @Param issuerDID string "The issuer's DID string"
// @Param issuerDIDPrivKeyJWKString string "The issuer's private jwk"
// @Param subjectJSON string "The subject JSON string containing the subject data"
// @Success js.Object "{ <Verifiable Credential>, <Verifiable Credential JWT> }"
// @Error js.Value "An error object with a message describing the error"
func createVerifiableCredential() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 3 {
			return generateError(errors.New("invalid arg count, usage: createVerifiableCredential(didString,didBase58PrivateKey,subjectJSONString)"))
		}

		issuerDID := args[0].String()
		issuerDIDPrivKeyJWKString := args[1].String()
		subjectJSON := args[2].String()
		issuanceDate := time.Now().Format(time.RFC3339)

		var knownJWK jwx.PrivateKeyJWK
		err := json.Unmarshal([]byte(issuerDIDPrivKeyJWKString), &knownJWK)
		if err != nil {
			return generateError(err)
		}

		signer, err := jwx.NewJWXSignerFromJWK(issuerDID, knownJWK)

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

		signedVCBytes, err := credential.SignVerifiableCredentialJWT(*signer, *vc)
		if err != nil {
			return generateError(err)
		}

		_, _, vcJSON, err := credential.ParseVerifiableCredentialFromJWT(string(signedVCBytes))

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

		_, _, cred, err := credential.ParseVerifiableCredentialFromJWT(args[0].String())
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

		didDoc, err := key.DIDKey(didKey).Expand()
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

		_, _, cred, err := credential.ParseVerifiableCredentialFromJWT(vcJWT)
		if err != nil {
			return generateError(err)
		}

		verifierKid := cred.Issuer.(string)

		jwtVerifier, err := jwx.NewJWXVerifier(verifierKid, verifierKid, cryptoPubKey)
		if err != nil {
			return generateError(err)
		}

		_, _, _, err = credential.VerifyVerifiableCredentialJWT(*jwtVerifier, vcJWT)
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

		presentationDefinitionInputString := args[0].String()
		signerDID := args[1].String()
		issuerDIDPrivKeyJWKString := args[2].String()
		holderDID := args[3].String()

		var presentationDefinition exchange.PresentationDefinition
		err := json.Unmarshal([]byte(presentationDefinitionInputString), &presentationDefinition)
		if err != nil {
			return generateError(err)
		}

		var knownJWK jwx.PrivateKeyJWK
		err = json.Unmarshal([]byte(issuerDIDPrivKeyJWKString), &knownJWK)
		if err != nil {
			return generateError(err)
		}

		signer, err := jwx.NewJWXSignerFromJWK(signerDID, knownJWK)
		if err != nil {
			return generateError(err)
		}

		presentationRequestBytes, err := exchange.BuildJWTPresentationRequest(*signer, presentationDefinition, []string{holderDID})
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

		presentationDefinitionInputString := args[0].String()
		signerDID := args[1].String()
		issuerDIDPrivKeyJWKString := args[2].String()
		vcJWT := args[3].String()

		var presentationDefinition exchange.PresentationDefinition
		err := json.Unmarshal([]byte(presentationDefinitionInputString), &presentationDefinition)
		if err != nil {
			return generateError(err)
		}

		var knownJWK jwx.PrivateKeyJWK
		err = json.Unmarshal([]byte(issuerDIDPrivKeyJWKString), &knownJWK)
		if err != nil {
			return generateError(err)
		}

		signer, err := jwx.NewJWXSignerFromJWK(signerDID, knownJWK)
		if err != nil {
			return generateError(err)
		}

		presentationClaim := exchange.PresentationClaim{
			Token:                         stringPtr(string(vcJWT)),
			JWTFormat:                     exchange.JWTVC.Ptr(),
			SignatureAlgorithmOrProofType: signer.ALG,
		}

		presentationSubmissionBytes, err := exchange.BuildPresentationSubmission(*signer, signer.ID, presentationDefinition, []exchange.PresentationClaim{presentationClaim}, exchange.JWTVPTarget)
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

		presentationDefinitionInputString := args[0].String()
		verifierDID := args[1].String()
		issuerDIDPrivKeyJWKString := args[2].String()
		presentationSubmissionJWT := args[3].String()

		var presentationDefinition exchange.PresentationDefinition
		err := json.Unmarshal([]byte(presentationDefinitionInputString), &presentationDefinition)
		if err != nil {
			return generateError(err)
		}

		var knownJWK jwx.PrivateKeyJWK
		err = json.Unmarshal([]byte(issuerDIDPrivKeyJWKString), &knownJWK)
		if err != nil {
			return generateError(err)
		}

		signer, err := jwx.NewJWXSignerFromJWK(verifierDID, knownJWK)
		if err != nil {
			return generateError(err)
		}

		verifier, err := signer.ToVerifier(verifierDID)
		if err != nil {
			return generateError(err)
		}

		resolver, err := resolution.NewResolver([]resolution.Resolver{key.Resolver{}}...)
		if err != nil {
			return generateError(err)
		}

		_, err = exchange.VerifyPresentationSubmission(context.Background(), *verifier, resolver, exchange.JWTVPTarget, presentationDefinition, []byte(presentationSubmissionJWT))
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

// stringPtr - returns a pointer to a string
func stringPtr(s string) *string {
	return &s
}

func main() {
	ch := make(chan struct{}, 0)
	js.Global().Set("createDIDKey", createDIDKey())
	js.Global().Set("createDIDIon", createDIDIon())
	js.Global().Set("resolveDID", resolveDID())
	js.Global().Set("parseJWTCredential", parseJWTCredential())
	js.Global().Set("createVerifiableCredential", createVerifiableCredential())
	js.Global().Set("verifyJWTCredential", verifyJWTCredential())
	js.Global().Set("createPresentationDefinition", createPresentationDefinition())
	js.Global().Set("createPresentationSubmission", createPresentationSubmission())
	js.Global().Set("createPresentationRequest", createPresentationRequest())
	js.Global().Set("verifyPresentationSubmission", verifyPresentationSubmission())
	<-ch
}
