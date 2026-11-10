# Security and privacy

This is an academic human-review prototype, not a security appliance. Do not treat a low score as proof of safety or automate blocking/releasing messages based solely on its output.

## Data boundaries

- Default demo records are synthetic. Local CSVs remain in page memory; the UI does not upload them, use local storage or run analytics.
- Optional Sheets loading reads only an explicitly configured public CSV URL. Browser configuration is public. The page never embeds Groq or Supabase credentials.
- A configured n8n execution sends message contents to Groq and stores results in Supabase. Use approved test data, private credentials and operator-defined retention/access controls. No cloud calls were made during preparation.
- Suspicious URLs remain text; neither the workflow heuristics nor the dashboard dereferences them.

## Defensive changes

Messages, LLM explanations and imported text are rendered using `textContent`. There is no data-driven HTML insertion, JSONP, dynamic remote script, formula evaluation or URL navigation. CSV structure, size, row counts and message lengths are bounded. Remote CSV loading has a timeout and byte limit.

Model output is parsed as a complete JSON document after optional surrounding code fences. Count, unique source IDs, statuses, numeric types/ranges, boolean consistency and reasons are checked. Invalid outputs are not coerced or clamped to zero. Unknown/contradictory CSV classifications also become errors.

Failed analyses have null score, confidence and suspicion and a separate classification. Their scores are excluded from averages. Provider error text is not copied into persisted explanations. The SQL example constrains successful/error row consistency.

## Remaining risks

Prompt instructions cannot guarantee resistance to prompt injection or incorrect judgments. Input snippets and model reasons can still contain private data; no automatic PII scrubber is implemented. The dashboard has no authentication and is unsuitable for publicly exposing confidential messages. CSP is defense in depth, not a complete security boundary. A malicious browser extension or modified deployment is outside this local audit.

The example schema enables RLS without adding public-read policies. No existing database permissions, credentials, production instance or account settings were modified. Use a dedicated test database and narrow server-side permissions; do not paste secrets into repository files or issues.

No API key, private key, credential-reference object or personal published-sheet URL was found by the publication scan of the prepared files. Pattern scans and visual review are bounded checks, not proof that every conceivable secret is absent. If an operator later publishes a real secret, revoke/rotate it; a subsequent deletion does not erase Git history.
