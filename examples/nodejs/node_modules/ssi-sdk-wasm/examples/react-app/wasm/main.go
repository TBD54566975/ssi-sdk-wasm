package main

import (
	"crypto/ed25519"
	"syscall/js"

	"github.com/goccy/go-json"

	"github.com/TBD54566975/ssi-sdk/crypto"
	"github.com/TBD54566975/ssi-sdk/did"
)

func myGolangFunction() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return args[0].Int() + args[1].Int()
	})
}

func makeDid() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		pubKey, _, _ := crypto.GenerateKeyByKeyType(crypto.Ed25519)
		didKey, _ := did.CreateDIDKey(crypto.Ed25519, pubKey.(ed25519.PublicKey))
		result, _ := didKey.Expand()

		// unmarshall into json bytes, then back into a simple struct for converting to js
		resultBytes, _ := json.Marshal(result)
		var resultObj map[string]interface{}
		json.Unmarshal(resultBytes, &resultObj)
		return js.ValueOf(resultObj)
	})
}

func main() {
	ch := make(chan struct{}, 0)
	js.Global().Set("makeDid", makeDid())
	js.Global().Set("myGolangFunction", myGolangFunction())
	<-ch
}
