# Report and exported-code comparison

The supplied 33-page report is dated June 2026. It was examined alongside all 15 ZIP entries, including both historical screenshots. It remains in the private source archive; the public edition documents its engineering content here.

| Topic | Supplied material | Portfolio edition |
| --- | --- | --- |
| Architecture | n8n, URL rules, Groq/Llama and Supabase | Retained |
| Batching | Report says ten messages; JSON uses five | Five preserved and documented |
| Ingestion | Original dataset/path; sanitized export uses `/files/` | Synthetic sample and configurable runtime path |
| Validator naming | Historical Gemini wording despite Groq model | English names consistent with actual integration |
| Text encoding | Several n8n strings contain mojibake | New readable prompt and node labels |
| Failure handling | Invalid/missing model data can become score zero and low risk | Explicit unscored analysis-error records |
| Result attribution | IDs reset per batch; model-echoed messages are trusted | IDs assigned before batching; original messages retained; ID/count/schema checks |
| Ground-truth labels | `label_real` is present in the batch sent to the model | Separate `prompt_lote` omits labels |
| URL rules | Substring checks can match shorteners/IPs in unrelated URL portions | Lexical host/authority checks; no network lookup |
| Dashboard source | Report suggests direct Supabase integration; supplied HTML reads Sheets | Demo/local CSV/optional public CSV; missing synchronization explicitly documented |
| Export button | Historical screenshot shows one; supplied HTML has no export handler | No CSV-export capability claimed |
| Remote loader | Optional Gviz/JSONP and CSV | Public CSV fetch only, constrained origin; no remote script execution |
| Presentation | Earlier screenshots show 76 records | New screenshots show twelve clearly labeled fictional rows |
| Evaluation | Qualitative/functional, no validated confusion matrix or precision/recall/F1 | Seventeen offline software tests plus browser checks, not detection-accuracy claims |
| Legal discussion | Academic discussion of Brazilian regulations | No compliance certification or legal conclusion claimed |

The report describes a historical functional prototype. Changes in this repository are a reviewed portfolio revision, not evidence that the revised workflow has been executed against Groq/Supabase. Model behavior still needs a labeled, leakage-free evaluation and adversarial testing.
