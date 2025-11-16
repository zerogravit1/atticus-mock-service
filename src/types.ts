export interface StoredResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface StoredRequest {
  url: string;
  method: string;
  headers: Record<string, string>
  rawBody: string;
  parsedBody?: unknown;
  signature: string; // hash
}

export interface AtticusConfig {
  recordMode: "record" | "replay" | "auto";
  mockDirectory: string;
}