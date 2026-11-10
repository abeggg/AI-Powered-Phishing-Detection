# Publication security review

Reviewed 2026-11-10. The author approved public release after reviewing the audit and test results. This document describes the reviewed portfolio edition; actual verification and deployment runs are available in the repository's Actions tab.

## Material reviewed

All 15 entries of the supplied ZIP were inspected: workflow, dashboard code/configuration, both CSVs, documentation, deployment configuration, the 33-page report and two historical screenshots. The original archive is preserved privately and was not modified.

The public candidate excludes the original report and historical screenshots, which contain personal acknowledgments and earlier dataset rows. It includes a report comparison and fresh screenshots with fictional data. No private dataset, real environment file or private cloud credential is intentionally included.

## Corrections

| Before | After | Why |
| --- | --- | --- |
| Missing or malformed model response can become score zero | Null scores and a separate analysis-error state | A processing failure provides no evidence of safety |
| Result IDs restart for each batch; model message echoes are trusted | IDs assigned before batching, validated by count and unique ID; original text retained | Prevent silent message/result mismatches |
| Ground-truth labels are sent with model inputs | Label-free `prompt_lote` | Avoid leaking the intended answer to the model |
| Values are coerced/clamped; incomplete results accepted | Explicit schema/type/range/status checks | Reject invalid analysis rather than fabricate a plausible value |
| Dashboard defaults unknown classification/score to low risk | Unknown, missing and contradictory records require review | Keep failures visible in both workflow and UI |
| Failed scores could affect averages | Errors counted separately and excluded from means | Avoid implying a low-risk dataset through failed analyses |
| Optional remote Gviz script executes third-party JavaScript | Constrained public CSV fetch, no JSONP | Avoid turning a feed URL into executable code |
| Historic data/screenshots look like current live output | Explicitly labeled synthetic demo and new screenshots | Separate interface demonstration from detection results |
| Inline dashboard and implicit controls | Separate HTML/CSS/JS, labels, keyboard focus, explicit empty/error states | Improve maintainability and reviewability |

## Publication scan

The prepared tree is checked for common API-token formats, private keys, private Sheets identifiers, personal Windows paths, n8n credential-reference objects, workflow instance identifiers, unexpected environment files, broken local links and invalid JSON/JavaScript. Results and file hashes are retained in the local approval bundle. Browser configuration is blank by default.

No plaintext API key, private key, personal sheet URL or n8n credential reference was found by those checks. This is a bounded source/pattern/visual review, not a penetration test or proof of complete security.

## Remaining limits

The revised export has not been imported or run in a real n8n instance. No Groq/Supabase credentials were configured; there were no model API calls or changes to production services. Prompt injection, false judgments and data privacy remain concerns. There is no model-accuracy benchmark. A public static deployment must remain limited to approved demonstration data.

## Sources consulted

- [n8n: preserving item linking in Code nodes](https://docs.n8n.io/build/work-with-data/reference-data/link-data-items/preserving-linking-in-the-code-node.md).
- [n8n: handling errors](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md).
- [Groq: structured-output guarantees and JSON-mode distinction](https://console.groq.com/docs/structured-outputs).

The workflow uses prompt-based JSON and local validation; it does not claim provider-enforced JSON Schema guarantees.
