export function safeParseJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function parseBodyFromContentType(contentType: string | undefined, raw: string) {
  if (!raw) return { rawBody: '', parseBody: undefined };

  const ct = (contentType ?? '').toLowerCase();

  if (ct.includes('application/json')) {
    const parsed = safeParseJson(raw);

    return { rawBody: raw, parsedBody: parsed ?? raw };
  }

  if (ct.includes('application/x-www-form-urlencoded')) {
    try {
      const obj = Object.fromEntries(new URLSearchParams(raw));
      return { rawBody: raw, parsedBody: obj };
    } catch {
      return { rawBody: raw, parsedBody: undefined }
    }
  }

  return { rawBody: raw, parsedBody: undefined };
}
