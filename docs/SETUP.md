# Setup

## Static dashboard

Open `dashboard/index.html`, or run `python -m http.server 8000 --directory dashboard` from the repository root. The default is twelve synthetic rows and no outbound feed request. The UI does not call Groq or Supabase.

`dashboard/config.js` may contain one **public** Google Sheets CSV export URL. It is blank by default. Only HTTPS `docs.google.com/spreadsheets/d/.../pub?output=csv` or `/export?format=csv` endpoints are accepted. A spreadsheet editor URL is not a data feed. Refresh is manual; remote failures retain the current records and show an alert. Browser-visible URLs must not grant access to private data. The earlier Gviz/JSONP script loader was removed.

## n8n workflow

1. Use a private test n8n instance. No n8n installation or runtime version was supplied or tested here; the export retains the supplied node type versions. Check availability of the disk reader, CSV extractor, Code, Loop Over Items, Wait, Basic LLM Chain, Groq model and Supabase nodes.
2. Import `workflow/phishing_detection_n8n.json`. It is inactive and contains no credential IDs. Do not activate it against production data as an import test.
3. Attach Groq and Supabase credentials in the private credential manager. Check that `llama-3.3-70b-versatile` is available to the account. A Groq credential may incur usage/plan limits; this preparation made no inference calls and configured no billing.
4. In a NEW, dedicated Supabase test database, review and execute `data/schema.sql`. It fails if the table already exists; it is not a migration for an existing application. Keep database credentials server-side. RLS is enabled and the example creates no public-read policy.
5. Make `data/sample_phishing_messages.csv` available as `/files/sample_phishing_messages.csv` inside the n8n runtime, or change the Read CSV path to an approved existing location. File access may be restricted by the instance. Cloud-hosted n8n may require a different ingestion node.
6. Execute manually. Confirm batch size five, label-free model input, one validated output per source ID, null scores on failures and successful inserts. The input normalization stops if a required message column is missing or a message exceeds 10,000 characters.
7. Exercise API failures, malformed JSON and database failures in the isolated test instance. Database errors stop the execution; row-level analysis errors can be persisted for human review. Consider an operator-owned n8n error workflow for notifications; this project does not send alerts.
8. Export approved rows to a CSV for dashboard import. No Supabase-to-Sheets synchronization job is included.

Fields persisted: `source_id`, `mensagem`, `analysis_status`, `error_reason`, nullable `score`/`confianca_ia`/`suspeito`, `classificacao`, `motivos`, `timestamp`, `model`, `prompt_version`. Source IDs are unique within an input execution, not globally across reruns; the database generates its own row ID. Retries/reruns are not idempotent.

## Offline verification

Node.js 22 or newer, no `npm install` needed:

```bash
npm run check
npm test
```

After editing `workflow/code/*.js`, run `node scripts/build-workflow.cjs`, review the generated JSON and rerun checks. These tests run the Code-node source against controlled fixtures; they do not start n8n or contact cloud services.

## GitHub Pages

After public-release approval, choose GitHub Actions as the Pages source and manually run **Publish dashboard to GitHub Pages**. The workflow runs checks before deploying only `dashboard/`. It needs repository-scoped Pages deployment permissions; no account-wide privilege change or paid service is required by the files. A successful deployment must still be verified on the actual URL.
