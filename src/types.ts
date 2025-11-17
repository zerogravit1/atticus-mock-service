export interface StoredResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface StoredRequestMeta {
  url: string;
  method: string;
  headers: Record<string, string>
  rawBody: string;
  parsedBody?: unknown;
  signature: string; // hash
  timestamp?: string;
}

export interface AtticusOptions {
  mockDir: string;
  recordMode: "record" | "replay" | "auto";
  autoApprove?: boolean;
}