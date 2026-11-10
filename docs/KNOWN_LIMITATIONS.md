# Known limitations

- Revised n8n runtime import/execution was not tested; only JSON structure, connections, embedded code and controlled Code-node fixtures were checked.
- No Groq inference, Supabase writes, public Sheets feed or Pages deployment was exercised during local preparation.
- No measured accuracy, precision, recall, F1, false-positive rate or business impact is available. Synthetic fixtures are not an evaluation dataset.
- No training/fine-tuning, email-header authentication, attachment analysis, sandbox, OCR, QR decoding, threat-intelligence lookup or automated containment is implemented.
- Lexical URL heuristics are weak, incomplete signals. Encoded, obfuscated or unusual URL forms may be missed.
- IDs identify source rows within one run. Re-execution and database retries can duplicate persisted results; no idempotency layer exists.
- The model's self-reported confidence is not calibrated. The revised prompt has not been benchmarked.
- Static dashboard data is demo, local CSV or a manually refreshed public CSV. Direct Supabase access and automatic export/sync are absent.
- No authentication, multiuser review, immutable audit trail, automatic PII redaction or legal-compliance certification exists.
- Reports of historic functional execution do not establish correctness of the revised workflow or effectiveness on real attacks.
