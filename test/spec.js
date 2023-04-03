const SSI = require('../dist/index.js');

describe('SSI tests', () => {
  test('createDIDKey should create a DID with "did" in the ID', async () => {
    const did = await SSI.createDIDKey();
    expect(did.didDocument.id.includes("did")).toBe(true);
    expect(did.privateKeyBase58.length > 1).toBe(true);
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
    const did = "did:key:z6Mkq7pU15BB27viF9JjkbXAqPBecGDB7H9NxYG5L4m2UVrV"
    const didPrivateKeyBase58 = "4vp15qPjT6R1WhbidL1fuULvJdEfDzRnSs1wLvYCa3LjCLYcJFrRYpHTHxZ6kpEcFdY2ULziwHTh6NYk8uJFhzNh"
    const credSubject = JSON.stringify({"id": did, "birthdate": "1975-01-01"})
    
    const vc = await SSI.createVerifiableCredential(did, didPrivateKeyBase58, credSubject)
    expect(vc).not.toBeNull()
    expect(vc.type[0]).toEqual("VerifiableCredential")
    expect(vc.credentialSubject.id).toEqual(did)
  });
});