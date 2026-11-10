// Resolve the current linked batch, not the first execution of a looping node.
const batch = $('Analyze URLs').item.json.lote;
if (!Array.isArray(batch) || !batch.length) throw new Error('The linked input batch is missing.');
const response = $input.first().json;
function errorRow(source, code) {
  return { json: { id: source.id, mensagem: source.mensagem, label_real: source.label_real,
    analysis_status: 'analysis_error', error_reason: code, score: null, confianca_ia: null,
    suspeito: null, motivos: ['Analysis unavailable. Human review required.'] }, pairedItem: { item: 0 } };
}
function failBatch(code) { return batch.map(source => errorRow(source, code)); }
if (response.error) return failBatch('provider_error');
let raw = response.text ?? response.output ?? response.response;
if (typeof raw !== 'string' || !raw.trim()) return failBatch('missing_response');
raw = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
let results;
try { results = JSON.parse(raw); } catch { return failBatch('invalid_json'); }
if (!Array.isArray(results) || results.length !== batch.length) return failBatch('result_count_mismatch');
const expected = new Set(batch.map(source => source.id));
const seen = new Set();
for (const result of results) {
  if (!result || typeof result !== 'object' || Array.isArray(result) || !Number.isInteger(result.id) || !expected.has(result.id) || seen.has(result.id)) return failBatch('id_mismatch');
  seen.add(result.id);
}
const byId = new Map(results.map(result => [result.id, result]));
return batch.map(source => {
  const result = byId.get(source.id);
  const bounded = value => Number.isInteger(value) && value >= 0 && value <= 100;
  if (!source.mensagem.trim()) return errorRow(source, 'empty_message');
  if (result.analysis_status === 'analysis_error') return errorRow(source, 'model_abstained');
  if (result.analysis_status !== 'ok' || !bounded(result.score) || !bounded(result.confianca_ia) || typeof result.suspeito !== 'boolean' || result.suspeito !== (result.score >= 40) || !Array.isArray(result.motivos) || !result.motivos.length || result.motivos.length > 8 || !result.motivos.every(reason => typeof reason === 'string' && reason.trim() && reason.length <= 300)) return errorRow(source, 'invalid_schema');
  return { json: { id: source.id, mensagem: source.mensagem, label_real: source.label_real,
    analysis_status: 'ok', error_reason: null, score: result.score, confianca_ia: result.confianca_ia,
    suspeito: result.score >= 40, motivos: result.motivos }, pairedItem: { item: 0 } };
});
