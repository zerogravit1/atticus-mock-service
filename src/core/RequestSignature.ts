import { StoredRequestMeta } from "../types.js";
import { hashObject } from "../utils/hash.js";

export function buildSignature(req: StoredRequestMeta): string {
  const signatureObject = {
    url: req.url,
    method: req.method,
    body: req.parsedBody ?? req.rawBody,
  };

  return hashObject(signatureObject);
}