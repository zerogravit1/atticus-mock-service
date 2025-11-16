import { StoredRequest } from "../types.js";
import { hashRequest } from "../utils/hash.js";

export function buildSignature(req: StoredRequest): string {
  const signatureObject = {
    url: req.url,
    method: req.method,
    body: req.parsedBody ?? req.rawBody,
  };

  return hashRequest(signatureObject);
}