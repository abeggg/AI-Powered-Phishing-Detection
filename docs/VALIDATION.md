# Validation scope

Local review: 2026-11-10, Windows, Node.js 24.21.0. No external credentials were used.

## Automated checks

`npm run check` verifies embedded Code-node sources against the JSON export and checks dashboard JavaScript syntax. `npm test` passed all 17 tests using Node's built-in runner.

Coverage includes risk boundaries, invalid/missing scores, unknown states, contradictory labels, CSV BOM/quotes/newlines, malformed inputs, prototype-like headers, averages excluding errors, search/filter/sort logic, constrained feed URLs, synthetic fixtures, global-within-run source IDs, label-free prompts, hostname-based URL signals, original-message preservation, malformed/provider/missing responses, duplicate/foreign IDs, strict schema validation and abstention.

The tests execute the actual editable Code-node sources with controlled `$input` and linked-node fixtures. They validate the code contract, not the n8n engine's item-linking/runtime behavior or a live provider response.

## Actual browser checks

- Default demo: 12 records; 4 high, 3 medium, 4 low, 1 error; average score 51/100 excludes the failed row.
- Searching for `fornecedor` returns one record; filtering analysis errors returns the unscored record.
- Ascending score order: 4,7,9,14,44,52,63,85,89,94,96,unscored. Newest order was also checked.
- Supplied five-row CSV imported through the real file picker, with source and counts updated.
- A separate three-row adversarial fixture retained explicit zero, isolated one failure, and rendered an HTML payload literally without creating an image element.
- Message details and the empty-search state worked with actual controls.
- An unclosed-quote CSV was rejected, showing an alert while preserving the previous dataset.
- Demo reset worked. No browser console errors were observed after the final reload.
- Screenshots were captured from this locally running revised application using synthetic data only.

## Not verified

No n8n runtime import, live Groq response, Supabase insert or external public Sheets feed was tested during preparation. No detection-accuracy or business-impact benchmark was produced. GitHub checks and Pages deployment are separate publication-stage validations; their actual run status is available in the repository's Actions tab.
