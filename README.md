# Atticus (atticus-mock-service)

Playwright-first API mock recorder/replayer.

Core features:
- Signature-based request matching (method + url + normalized body)
- File-backed mocks (JSON files per signature)
- Modes: record, replay, auto
- Attach to Playwright `page` with `await service.attachToPage(page)`

Usage (example):
- Build package
- In Playwright fixtures, create a MockService and call attachToPage(page)

TLS notes:
- route.fetch uses Node's TLS stack. If you see "unable to get local issuer certificate",
  set NODE_EXTRA_CA_CERTS=/path/to/corp-root.pem and also use ignoreHTTPSErrors: true in Playwright config.
