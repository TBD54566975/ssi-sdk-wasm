const SSI = require('../dist/index.js');

describe('SSI tests', () => {
  test('createDIDKey should create a DID with "did" in the ID', async () => {
    const did = await SSI.createDIDKey();
    expect(did.didDocument.id.includes("did")).toBe(true);
    expect(did.privateKeyBase58.length > 1).toBe(true);
    expect(did.didDocument.verificationMethod[0].publicKeyBase58.length > 1).toBe(true);
  });

  test('parseJWTCredential invalid jwt', async () => {
    const invalidJWTCred = "abc"
    const expectedSubstring = 'could not parse credential token';
    await expect(SSI.parseJWTCredential(invalidJWTCred)).rejects.toThrow(expectedSubstring);
  });

  test('parseJWTCredential should parse a valid jwt', async () => {
    const jwtCred = "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2p4V252QnROQVFmSEZ3QVNLSHZvclhSWUdRdU5EWWlTc2p2NjFqNG5YZVZpIiwidHlwIjoiSldUIn0.eyJleHAiOjI1ODAxMzAwODAsImlzcyI6ImRpZDprZXk6ejZNa2p4V252QnROQVFmSEZ3QVNLSHZvclhSWUdRdU5EWWlTc2p2NjFqNG5YZVZpIiwianRpIjoiZTcyYWZjZDAtMzJkZS00YTgzLThmNzktNDUyOTM0ZTVhZmJiIiwibmJmIjoxNjY2MzY1OTUxLCJzdWIiOiJkaWQ6a2V5Ono2TWtqeFdudkJ0TkFRZkhGd0FTS0h2b3JYUllHUXVORFlpU3NqdjYxajRuWGVWaSIsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sImlkIjoiZTcyYWZjZDAtMzJkZS00YTgzLThmNzktNDUyOTM0ZTVhZmJiIiwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJpc3N1ZXIiOiJkaWQ6a2V5Ono2TWtqeFdudkJ0TkFRZkhGd0FTS0h2b3JYUllHUXVORFlpU3NqdjYxajRuWGVWaSIsImlzc3VhbmNlRGF0ZSI6IjIwMjItMTAtMjFUMTU6MjU6NTFaIiwiZXhwaXJhdGlvbkRhdGUiOiIyMDUxLTEwLTA1VDE0OjQ4OjAwLjAwMFoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJhZGRpdGlvbmFsTmFtZSI6ImhhbmsgaGlsbCIsImJpcnRoRGF0ZSI6IjIwMDktMDEtMDMiLCJmYW1pbHlOYW1lIjoic2ltcHNvbiIsImdpdmVuTmFtZSI6InJpY2t5IGJvYmJ5IiwiaWQiOiJkaWQ6a2V5Ono2TWtqeFdudkJ0TkFRZkhGd0FTS0h2b3JYUllHUXVORFlpU3NqdjYxajRuWGVWaSIsInBvc3RhbEFkZHJlc3MiOnsiYWRkcmVzc0NvdW50cnkiOiJVLlMuQSIsImFkZHJlc3NMb2NhbGl0eSI6IkF1c3RpbiIsImFkZHJlc3NSZWdpb24iOiJUWCIsInBvc3RhbENvZGUiOiI3ODcyNCIsInN0cmVldEFkZHJlc3MiOiIxMjMgSmFua3RvcGlhIEF2ZS4ifSwidGF4SUQiOiIxMjMifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6IjQ3M2NlMjg1LWNkNTEtNGYwNy04MzE0LTliYzdhZjBhNzEyZiIsInR5cGUiOiJKc29uU2NoZW1hVmFsaWRhdG9yMjAxOCJ9fX0.KJv_RabWfyFdIOcfHgEbGH7mbLb1seqK_k9oNHHKYv0rPtHwOUSCcC6UvWg0_8BYnZLo7Tjz9KcgZCzWu-nXBg"
    const cred = await SSI.parseJWTCredential(jwtCred);
    expect(cred).not.toBeNull()
    expect(cred.type[0]).toEqual("VerifiableCredential")
    expect(cred.issuer).toEqual("did:key:z6MkjxWnvBtNAQfHFwASKHvorXRYGQuNDYiSsjv61j4nXeVi")
  });

  test('createVerifiableCredential should create a valid VC', async () => {
    const did = "did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4"
    const didPrivateKeyBase58 = "5kBPXRJpznydNAj2F7DHr2HSx72VTSGrrx8nuce9zgCKBFFs7gQH1WoiZ3Q9KudY3TefDbhs9QmEUW2iCXayowh6"
    const credSubject = JSON.stringify({"id": did, "birthdate": "1975-01-01"})
    
    const vc = await SSI.createVerifiableCredential(did, didPrivateKeyBase58, credSubject)
    expect(vc).not.toBeNull()
    expect(vc.vc.type[0]).toEqual("VerifiableCredential")
    expect(vc.vc.credentialSubject.id).toEqual(did)
    expect(vc.vcJWT.length).toBeGreaterThan(10)
  });

  test('verifyJWTCredential should verify a valid jwt', async () => {
    const jwtCred = "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3V4cjh5NnV5YXplMVVvWFhHSGh1WkJjdW9uOHlpTkVoMTJIaDg1VjhoRXg0IiwidHlwIjoiSldUIn0.eyJpc3MiOiJkaWQ6a2V5Ono2TWt1eHI4eTZ1eWF6ZTFVb1hYR0hodVpCY3Vvbjh5aU5FaDEySGg4NVY4aEV4NCIsImp0aSI6ImUwM2IxZWNlLWY2YzYtNDQxMC05MjJiLThmYTIwM2IzYzM4YyIsIm5iZiI6MTY4MDY0MzgzNywic3ViIjoiZGlkOmtleTp6Nk1rdXhyOHk2dXlhemUxVW9YWEdIaHVaQmN1b244eWlORWgxMkhoODVWOGhFeDQiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJpZCI6ImUwM2IxZWNlLWY2YzYtNDQxMC05MjJiLThmYTIwM2IzYzM4YyIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjoiZGlkOmtleTp6Nk1rdXhyOHk2dXlhemUxVW9YWEdIaHVaQmN1b244eWlORWgxMkhoODVWOGhFeDQiLCJpc3N1YW5jZURhdGUiOiIyMDIzLTA0LTA0VDE2OjMwOjM3LTA1OjAwIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiYmlydGhkYXRlIjoiMTk3NS0wMS0wMSIsImlkIjoiZGlkOmtleTp6Nk1rdXhyOHk2dXlhemUxVW9YWEdIaHVaQmN1b244eWlORWgxMkhoODVWOGhFeDQifX19.S5mW3QLWgEc6T5yimz2ewjzXJyPH21-sKwbwrfYCF_uvrXinr6k0kCo2vEsZc92kBsr0SR2FjLxP-MG8MQKhDQ"
    const publicKeyBase58 = "GWb6NrfYFT9YNJgpaik4i64uzCs8JUzLK1NmHoX7n2Ag"
    const did = "did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4"
    const authentic = await SSI.verifyJWTCredential(jwtCred, did);
    expect(authentic).toBe(true)
  });

  test('createPresentationDefinition to be valid', async() =>{

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

  test('createPresentationRequest to be valid', async() =>{
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

    const signerDID = "did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4"
    const signerPrivateKeyBase58 = "5kBPXRJpznydNAj2F7DHr2HSx72VTSGrrx8nuce9zgCKBFFs7gQH1WoiZ3Q9KudY3TefDbhs9QmEUW2iCXayowh6"
    const presentationRequest = await SSI.createPresentationRequest(JSON.stringify(presentationDefinition), signerDID, signerPrivateKeyBase58, "did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4")
    expect(presentationRequest.presentationRequestJWT.length).toBeGreaterThan(10)
  })

  test('createPresentationSubmission to be valid', async() =>{
    const signerDID = "did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4"
    const signerPrivateKeyBase58 = "5kBPXRJpznydNAj2F7DHr2HSx72VTSGrrx8nuce9zgCKBFFs7gQH1WoiZ3Q9KudY3TefDbhs9QmEUW2iCXayowh6"

    const presentationDefinitionInput = JSON.stringify({
      "id": "example-id",
      "name": "name",
      "purpose": "purpose",
      "input_descriptors": [
        {
          "id": "birthdate",
          "name": "b day",
          "purpose": "to get your birthday",
          "constraints": {
            "fields": [
              {
                "id": "birthdate",
                "path": [
                  "$.credentialSubject.birthdate",
                  "$.vc.credentialSubject.birthdate"
                ]
              }
            ]
          }
        }
      ]
    })

    const credSubject = JSON.stringify({"id": signerDID, "birthdate": "1975-01-01"})
    const vc = await SSI.createVerifiableCredential(signerDID, signerPrivateKeyBase58, credSubject)

    const presentationRequest = await SSI.createPresentationSubmission(presentationDefinitionInput, signerDID, signerPrivateKeyBase58, vc.vcJWT)
    expect(presentationRequest.presentationSubmissionJWT.length).toBeGreaterThan(10)
  })

  test('verifyPresentationSubmission to be valid', async() =>{
    const signerDID = "did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4"
    const signerPrivateKeyBase58 = "5kBPXRJpznydNAj2F7DHr2HSx72VTSGrrx8nuce9zgCKBFFs7gQH1WoiZ3Q9KudY3TefDbhs9QmEUW2iCXayowh6"

    const presentationDefinitionInput = JSON.stringify({
      "id": "example-id",
      "name": "name",
      "purpose": "purpose",
      "input_descriptors": [
        {
          "id": "birthdate",
          "name": "b day",
          "purpose": "to get your birthday",
          "constraints": {
            "fields": [
              {
                "id": "birthdate",
                "path": [
                  "$.credentialSubject.birthdate",
                  "$.vc.credentialSubject.birthdate"
                ]
              }
            ]
          }
        }
      ]
    })

    const credSubject = JSON.stringify({"id": signerDID, "birthdate": "1975-01-01"})
    const vc = await SSI.createVerifiableCredential(signerDID, signerPrivateKeyBase58, credSubject)

    const presentationRequest = await SSI.createPresentationSubmission(presentationDefinitionInput, signerDID, signerPrivateKeyBase58, vc.vcJWT)
    expect(presentationRequest.presentationSubmissionJWT.length).toBeGreaterThan(10)
    console.log(presentationRequest.presentationSubmissionJWT)


    // TODO: provide valid input for a valid presentation submission
    const expectedSubstring = 'invalid presentation submission in provided verifiable presentation';
    await expect(SSI.verifyPresentationSubmission(presentationDefinitionInput, signerDID, signerPrivateKeyBase58, presentationRequest.presentationSubmissionJWT)).rejects.toThrow(expectedSubstring);
  })

});