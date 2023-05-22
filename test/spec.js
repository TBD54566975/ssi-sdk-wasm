const SSI = require('../dist/index.js');

describe('SSI tests', () => {
  test('createDIDKey should create a DID with "did" in the ID', async () => {
    const did = await SSI.createDIDKey();
    expect(did.didDocument.id.includes("did")).toBe(true);
    expect(did.didDocument.verificationMethod[0].publicKeyBase58.length > 1).toBe(true);

    const privKeyJWKJson = JSON.parse(did.privKeyJWK)
    expect(privKeyJWKJson).toBeDefined()
    expect(privKeyJWKJson['kty']).toEqual("OKP")
    expect(privKeyJWKJson['alg']).toEqual("EdDSA")
    expect(privKeyJWKJson['kid'].length).toBeDefined()
    expect(privKeyJWKJson['x'].length).toBeDefined()
    expect(privKeyJWKJson['d'].length).toBeDefined()
  });

  test('createDIDIon should create a DID with "did" in the ID', async () => {
    const did = await SSI.createDIDIon();

    expect(did.didDocument.id).toBeDefined()
    expect(did.didDocument.id.includes("did")).toBe(true);
    expect(did.didDocument.longForm).toBeDefined()
    expect(did.didDocument.longForm.includes("did")).toBe(true);
    expect(did.didDocument.recoveryPrivateJWK).toBeDefined()

    const privKeyJWKJson = JSON.parse(did.privKeyJWK)
    expect(privKeyJWKJson).toBeDefined()
    expect(privKeyJWKJson['kty']).toEqual("OKP")
    expect(privKeyJWKJson['alg']).toEqual("EdDSA")
    expect(privKeyJWKJson['kid'].length).toBeDefined()
    expect(privKeyJWKJson['x'].length).toBeDefined()
    expect(privKeyJWKJson['d'].length).toBeDefined()
  });

  test('resolveDID should resolve dids', async () => {
    const didKey = await SSI.createDIDKey();
    expect(didKey.didDocument.id.includes("did")).toBe(true);

    const resolvedDIDKey = await SSI.resolveDID(didKey.didDocument.id)
    expect(resolvedDIDKey.didDocument.id.includes("did")).toBe(true);

    const resolvedDIDWeb = await SSI.resolveDID("did:web:tbd.website")
    expect(resolvedDIDWeb.didDocument.id.includes("did")).toBe(true);

    const resolvedDIDIon = await SSI.resolveDID("did:ion:EiCsRhqxDDaq8d4sRyJriWQ-xfg6INxbT-baVTX8A6ghHQ")
    expect(resolvedDIDIon.didDocument.id.includes("did")).toBe(true);
  });

  test('createVerifiableCredential should create a valid VC', async () => {
    const didKey = await SSI.createDIDKey();
    expect(didKey.didDocument.id.includes("did")).toBe(true);

    let credSubject = JSON.stringify({ "id": didKey.didDocument.id, "birthdate": "1975-01-01" })
    const vc = await SSI.createVerifiableCredential(didKey.didDocument.id, didKey.privKeyJWK, credSubject)
    expect(vc.vc.issuer).toEqual(didKey.didDocument.id)
    expect(vc.vcJWT.length).toBeGreaterThan(10)

    const didIon = await SSI.createDIDIon();
    expect(didIon.didDocument.id.includes("did")).toBe(true);

    credSubject = JSON.stringify({ "id": didIon.didDocument.id, "birthdate": "1975-01-01" })
    const vcIonIssuer = await SSI.createVerifiableCredential(didIon.didDocument.id, didIon.privKeyJWK, credSubject)
    expect(vcIonIssuer.vc.issuer).toEqual(didIon.didDocument.id)
    expect(vcIonIssuer.vcJWT.length).toBeGreaterThan(10)
  });

  test('parseJWTCredential invalid jwt', async () => {
    const invalidJWTCred = "abc"
    const expectedSubstring = 'parsing credential token: invalid JWT';
    await expect(SSI.parseJWTCredential(invalidJWTCred)).rejects.toThrow(expectedSubstring);
  });

  test('parseJWTCredential should parse a valid jwt', async () => {
    const jwtCred = "eyJhbGciOiJFZERTQSIsImtpZCI6ImZhNzUwZWUyLTRkMjctNDg1ZS1hYzg1LTljZmJhMDZiZDkzNyIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2ODQ0NDA2MDcsImlzcyI6ImRpZDprZXk6ejZNa3RzeWMxM1FXUGthZURyVTFQVHRmbllBUUJNU0cyUVZxQXBuUHphQnB3M1dOIiwianRpIjoiYmExYzU0ZGItOTcwYy00N2YyLWEyZGQtODI2MWYyMzA4ZWI2IiwibmJmIjoxNjg0NDQwNjA3LCJub25jZSI6IjQ5YzBlYmVhLWU5YzktNGI0Yy05M2JkLTM4Nzk2ZmMwYTVlOCIsInN1YiI6ImRpZDprZXk6ejZNa3RzeWMxM1FXUGthZURyVTFQVHRmbllBUUJNU0cyUVZxQXBuUHphQnB3M1dOIiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJpc3N1ZXIiOiIiLCJpc3N1YW5jZURhdGUiOiIiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJiaXJ0aGRhdGUiOiIxOTc1LTAxLTAxIn19fQ.5szcfYvoKSUCMmSklGQbxrkVAGMgMT6VXtDd5VzqRdTFSUjc8C34e6Zt0bcRq5iPT21nevbUfrcWhhPwli17Dg"
    const cred = await SSI.parseJWTCredential(jwtCred);
    expect(cred).not.toBeNull()
    expect(cred.type[0]).toEqual("VerifiableCredential")
    expect(cred.issuer).toEqual("did:key:z6Mktsyc13QWPkaeDrU1PTtfnYAQBMSG2QVqApnPzaBpw3WN")
  });

  test('verifyJWTCredential should verify a valid jwt', async () => {
    const jwtCred = "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3V4cjh5NnV5YXplMVVvWFhHSGh1WkJjdW9uOHlpTkVoMTJIaDg1VjhoRXg0IiwidHlwIjoiSldUIn0.eyJpc3MiOiJkaWQ6a2V5Ono2TWt1eHI4eTZ1eWF6ZTFVb1hYR0hodVpCY3Vvbjh5aU5FaDEySGg4NVY4aEV4NCIsImp0aSI6ImUwM2IxZWNlLWY2YzYtNDQxMC05MjJiLThmYTIwM2IzYzM4YyIsIm5iZiI6MTY4MDY0MzgzNywic3ViIjoiZGlkOmtleTp6Nk1rdXhyOHk2dXlhemUxVW9YWEdIaHVaQmN1b244eWlORWgxMkhoODVWOGhFeDQiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJpZCI6ImUwM2IxZWNlLWY2YzYtNDQxMC05MjJiLThmYTIwM2IzYzM4YyIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjoiZGlkOmtleTp6Nk1rdXhyOHk2dXlhemUxVW9YWEdIaHVaQmN1b244eWlORWgxMkhoODVWOGhFeDQiLCJpc3N1YW5jZURhdGUiOiIyMDIzLTA0LTA0VDE2OjMwOjM3LTA1OjAwIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiYmlydGhkYXRlIjoiMTk3NS0wMS0wMSIsImlkIjoiZGlkOmtleTp6Nk1rdXhyOHk2dXlhemUxVW9YWEdIaHVaQmN1b244eWlORWgxMkhoODVWOGhFeDQifX19.S5mW3QLWgEc6T5yimz2ewjzXJyPH21-sKwbwrfYCF_uvrXinr6k0kCo2vEsZc92kBsr0SR2FjLxP-MG8MQKhDQ"
    const publicKeyBase58 = "GWb6NrfYFT9YNJgpaik4i64uzCs8JUzLK1NmHoX7n2Ag"
    const did = "did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4"
    const authentic = await SSI.verifyJWTCredential(jwtCred, did);
    expect(authentic).toBe(true)
  });

  test('verifyJWTCredential should not verify an invalid did', async () => {
    const jwtCred = "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3V4cjh5NnV5YXplMVVvWFhHSGh1WkJjdW9uOHlpTkVoMTJIaDg1VjhoRXg0IiwidHlwIjoiSldUIn0.eyJpc3MiOiJkaWQ6a2V5Ono2TWt1eHI4eTZ1eWF6ZTFVb1hYR0hodVpCY3Vvbjh5aU5FaDEySGg4NVY4aEV4NCIsImp0aSI6ImUwM2IxZWNlLWY2YzYtNDQxMC05MjJiLThmYTIwM2IzYzM4YyIsIm5iZiI6MTY4MDY0MzgzNywic3ViIjoiZGlkOmtleTp6Nk1rdXhyOHk2dXlhemUxVW9YWEdIaHVaQmN1b244eWlORWgxMkhoODVWOGhFeDQiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJpZCI6ImUwM2IxZWNlLWY2YzYtNDQxMC05MjJiLThmYTIwM2IzYzM4YyIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjoiZGlkOmtleTp6Nk1rdXhyOHk2dXlhemUxVW9YWEdIaHVaQmN1b244eWlORWgxMkhoODVWOGhFeDQiLCJpc3N1YW5jZURhdGUiOiIyMDIzLTA0LTA0VDE2OjMwOjM3LTA1OjAwIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiYmlydGhkYXRlIjoiMTk3NS0wMS0wMSIsImlkIjoiZGlkOmtleTp6Nk1rdXhyOHk2dXlhemUxVW9YWEdIaHVaQmN1b244eWlORWgxMkhoODVWOGhFeDQifX19.S5mW3QLWgEc6T5yimz2ewjzXJyPH21-sKwbwrfYCF_uvrXinr6k0kCo2vEsZc92kBsr0SR2FjLxP-MG8MQKhDQ"
    const did = "did:key:z6Mktsyc13QWPkaeDrU1PTtfnYAQBMSG2QVqApnPzaBpw3WN"
    const expectedSubstring = 'verifying JWT: verifying JWT: could not verify message using any of the signatures or keys';
    await expect(SSI.verifyJWTCredential(jwtCred, did)).rejects.toThrow(expectedSubstring);
  });

  test('verifyJWTCredential should not verify an invalid did', async () => {
    const jwtCred = "invalid"
    const did = "did:key:z6Mktsyc13QWPkaeDrU1PTtfnYAQBMSG2QVqApnPzaBpw3WN"
    const expectedSubstring = 'parsing credential token: invalid JWT';
    await expect(SSI.verifyJWTCredential(jwtCred, did)).rejects.toThrow(expectedSubstring);
  });

  test('verifyJWTCredential  should parse a valid jwt with created vc', async () => {
    const issuerDID = await SSI.createDIDKey();
    const credSubject = JSON.stringify({"id": issuerDID.didDocument.id, "birthdate": "1975-01-01"})
    const vc = await SSI.createVerifiableCredential(issuerDID.didDocument.id, issuerDID.privKeyJWK, credSubject)
    const authentic = await SSI.verifyJWTCredential(vc.vcJWT, issuerDID.didDocument.id);
    expect(authentic).toBe(true)
  });

  test('createPresentationDefinition to be valid', async () => {
    const presentationDefinitionInput = JSON.stringify({
      "id": "example-id",
      "name": "name",
      "purpose": "purpose",
      "input_descriptors": [
        {
          "id": "wa_driver_license",
          "name": "washington state business license",
          "purpose": "some testing stuff",
          "constraints": {
            "fields": [
              {
                "id": "date_of_birth",
                "path": [
                  "$.credentialSubject.dateOfBirth",
                  "$.credentialSubject.dob",
                  "$.vc.credentialSubject.dateOfBirth",
                  "$.vc.credentialSubject.dob"
                ]
              }
            ]
          }
        }
      ]
    })

    const presentationDefinition = await SSI.createPresentationDefinition(presentationDefinitionInput)
    expect(presentationDefinition.presentationDefinition.id).toBe("example-id")
  })

  test('createPresentationRequest to be valid', async () => {
    const presentationDefinitionInput = JSON.stringify({
      "id": "example-id",
      "name": "name",
      "purpose": "purpose",
      "input_descriptors": [
        {
          "id": "wa_driver_license",
          "name": "washington state business license",
          "purpose": "some testing stuff",
          "constraints": {
            "fields": [
              {
                "id": "date_of_birth",
                "path": [
                  "$.credentialSubject.dateOfBirth",
                  "$.credentialSubject.dob",
                  "$.vc.credentialSubject.dateOfBirth",
                  "$.vc.credentialSubject.dob"
                ]
              }
            ]
          }
        }
      ]
    })



    const presentationDefinition = await SSI.createPresentationDefinition(presentationDefinitionInput)
    expect(presentationDefinition.presentationDefinition.id).toBe("example-id")
    expect(presentationDefinition.presentationDefinition.input_descriptors[0].id).toBe("wa_driver_license")

    const didKey = await SSI.createDIDKey();
    expect(didKey.didDocument.id.includes("did")).toBe(true);

    const presentationRequest = await SSI.createPresentationRequest(JSON.stringify(presentationDefinition.presentationDefinition), didKey.didDocument.id, didKey.privKeyJWK, "did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4")
    expect(presentationRequest.presentationRequestJWT.length).toBeGreaterThan(10)
  })

  test('Create Presentation Submission and check if it is valid', async() =>{
    const presentationDefinitionInput = JSON.stringify({
      "id":"test-id",
      "input_descriptors":[
        {
          "id":"id-1",
          "constraints":{
            "fields":[
              {
                "id":"issuer-input-descriptor",
                "path":[
                  "$.vc.issuer",
                  "$.issuer"
                ],
                "purpose":"need to check the issuer"
              }
            ]
          }
        }
      ]
    })

    const issuerDID = await SSI.createDIDKey();
    const subjectDID = await SSI.createDIDKey();

    const credSubject = JSON.stringify({"id": subjectDID.didDocument.id, "birthdate": "1975-01-01"})
    const vc = await SSI.createVerifiableCredential(issuerDID.didDocument.id, issuerDID.privKeyJWK, credSubject)

    const presentationSubmission = await SSI.createPresentationSubmission(presentationDefinitionInput, subjectDID.didDocument.id, issuerDID.privKeyJWK, vc.vcJWT)
    expect(presentationSubmission.presentationSubmissionJWT.length).toBeGreaterThan(10)

    // TODO: Fix signer
    // const verified = await SSI.verifyPresentationSubmission(presentationDefinitionInput, subjectDID.didDocument.id, issuerDID.privKeyJWK, presentationSubmission.presentationSubmissionJWT)
    // console.log(verified)
  })
});