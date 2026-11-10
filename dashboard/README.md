# Dashboard

Static HTML/CSS/JavaScript. Open `index.html` or serve this folder. No build step, dependencies, API keys or model access are needed. The default twelve records are entirely fictional.

Use **Import CSV** with `demo_results.csv`. Recognized message aliases are `Mensagem`, `mensagem`, `message`; score aliases are `Score`, `score`. Optional fields include `Classificacao`/`classificacao`, `Motivos`/`motivos`, `Timestamp`/`timestamp`/`created_at`, `Confiabilidade`/`confianca_ia`/`Confianca_IA`, `analysis_status`, `error_reason`.

Risk bands are derived from valid integer scores. Missing/invalid scores, unknown statuses or unknown/contradictory classifications become analysis errors. Valid score zero is retained. Confidence may be absent; it is never inferred from risk. Failed rows are excluded from averages and remain visible/filterable.

Limits: 5 MB, 10,000 records, 10,000 characters per message, and 100 rows per visible page. Malformed files preserve the previous dataset and show an alert. The parser supports commas, escaped double quotes, quoted newlines, CRLF and a UTF-8 BOM.

`config.js` optionally contains one public Google Sheets CSV export URL. It is blank by default. Refresh is manual and does not execute a Gviz/JSONP response. The dashboard is not connected to Supabase and does not run the n8n workflow. Local imports are kept only in memory; no upload, persistence or analytics is implemented.
