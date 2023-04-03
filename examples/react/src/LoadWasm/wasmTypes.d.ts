declare global {
  export interface Window {
    Go: any;
    createDIDKey: ()=>string
    parseJWTCredential: (jwt: string)=>any
    createVerifiableCredential: (issuerDID: string, issuerDIDPrivateKey: string, subjectJSON: string)=>string
  }
}

export {};
