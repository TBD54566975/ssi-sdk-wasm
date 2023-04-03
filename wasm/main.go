//go:build js && wasm

package main

import (
	"syscall/js"

	"time"

	"github.com/goccy/go-json"
	"github.com/pkg/errors"

	"crypto/ed25519"

	"github.com/TBD54566975/ssi-sdk/credential"

	"github.com/TBD54566975/ssi-sdk/crypto"

	"github.com/TBD54566975/ssi-sdk/credential/signing"
	"github.com/TBD54566975/ssi-sdk/did"
	"github.com/mr-tron/base58"
)

// createDIDKey
//
// @Summary     Create DID:Key pair
// @Description Generate a DID key pair (using Ed25519) and return a JavaScript object containing the DID document and the private key in Base58 format
// @Success     js.Object "{ didDocument: <object>, privateKeyBase58: <string> }"
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
func createVerifiableCredential() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 3 {
			return generateError(errors.New("invalid arg count, usage: createVerifiableCredential(didString,didBase58PrivateKey,subjectJSONString)"))
		}

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
		privKeyFromBytes, err := crypto.BytesToPrivKey(privateKeyBytes, crypto.Ed25519)
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

		return js.ValueOf(resultObj)
	})
}

// parseJWTCredential
//
// @Summary Parse JWT Verifiable Credential
// @Description Parse a JWT Verifiable Credential from the provided JWT string, and return the corresponding credential as a JavaScript object
// @Param jwtCredential string "The JWT string representing the Verifiable Credential"
// @Success js.Object "{ <Verifiable Credential fields> }"
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

func main() {
	ch := make(chan struct{}, 0)
	js.Global().Set("createDIDKey", createDIDKey())
	js.Global().Set("resolveDid", resolveDID())
	js.Global().Set("parseJWTCredential", parseJWTCredential())
	js.Global().Set("createVerifiableCredential", createVerifiableCredential())
	<-ch
}
