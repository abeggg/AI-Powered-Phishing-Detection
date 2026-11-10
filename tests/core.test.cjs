const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Core = require('../dashboard/core.js');
const root = path.resolve(__dirname, '..');
function node(name, input, batch) {
  const code = fs.readFileSync(path.join(root, 'workflow/code', name + '.js'), 'utf8');
  return new Function('$input', '$', code)({ all: () => input, first: () => input[0] }, () => ({ item: { json: { lote: batch } } }));
}
const batch = [ { id: 6, mensagem: 'Original message six', label_real: 'Phishing' }, { id: 7, mensagem: 'Original message seven', label_real: 'Legitimate' } ];
function result(id, score) { return { id, analysis_status: 'ok', score, confianca_ia: 80, suspeito: score >= 40, motivos: ['A test reason'] }; }
function validate(response) { return node('validate-response', [{ json: response }], batch); }
function normalized(response) { return node('normalize-results', validate(response)).map(item => item.json); }

test('risk boundaries and explicit zero are preserved', () => {
  assert.deepEqual([0,39,40,70,71,100].map(Core.riskFor), ['low','low','medium','medium','high','high']);
  assert.equal(Core.normalizeRecord({ Mensagem: 'hello', Score: 0 }, 0).risk, 'low');
});
test('absent, non-finite and invalid scores never become low risk', () => {
  for (const Score of ['', null, undefined, 'NaN', 'Infinity', -1, 101, '0x10', true, 4.5]) assert.equal(Core.normalizeRecord({ Mensagem: 'message', Score },0).risk, 'error');
});
test('unknown status, unknown labels and contradictory labels require review', () => {
  for (const row of [{ Score: 0, analysis_status: 'analysis_error' }, { Score: 10, Classificacao: 'unknown' }, { Score: 90, Classificacao: 'BAIXO RISCO' }, { Score: 5, analysis_status: 'pending' }]) assert.equal(Core.normalizeRecord({ Mensagem: 'message', ...row },0).risk,'error');
});
test('CSV supports BOM, CRLF, quoted commas, newlines and escaped quotes', () => {
  const data = Core.parseCSV('\uFEFFMensagem,Score,Motivos\r\n"hello,\n""world""",40,"some, reason"\r\n');
  assert.equal(data[0].message,'hello,\n"world"'); assert.equal(data[0].risk,'medium');
});
test('malformed CSV, duplicate headers and mismatched columns fail visibly', () => {
  for(const csv of ['Mensagem,Score\n"unclosed,3', 'Mensagem,Score,Score\nhi,0,0', 'Mensagem,Score\nhi,0,extra', 'Unknown\nhi', 'Mensagem,Score\n"hi"x,3']) assert.throws(()=>Core.parseCSV(csv));
});
test('prototype-like CSV headers cannot change object prototypes', () => {
  const data=Core.parseCSV('Mensagem,Score,__proto__\nhello,10,malicious'); assert.equal(data[0].risk,'low'); assert.equal({}.malicious,undefined);
});
test('errors are excluded from averages and sorted after scored records', () => {
  const rows=[Core.normalizeRecord({ Mensagem:'first',Score:90 },0),Core.normalizeRecord({ Mensagem:'failed' },1),Core.normalizeRecord({ Mensagem:'third',Score:10 },2)];
  const summary=Core.summarize(rows);assert.equal(summary.average,50);assert.equal(summary.error,1);assert.deepEqual(Core.select(rows,{sort:'risk-asc'}).map(r=>r.score),[10,90,null]);
  assert.equal(Core.select(rows,{query:'failed',risk:'error'}).length,1);
});
test('feed URLs reject script execution, arbitrary hosts and editor links', () => {
  for(const url of ['javascript:alert(1)','https://evil.example/export?format=csv','https://docs.google.com.evil.example/spreadsheets/d/a/pub?output=csv','https://docs.google.com/spreadsheets/d/a/edit','https://user@docs.google.com/spreadsheets/d/a/pub?output=csv']) assert.throws(()=>Core.validateFeed(url));
  assert.match(Core.validateFeed('https://docs.google.com/spreadsheets/d/e/EXAMPLE/pub?output=csv'),/^https:/);
});
test('demo includes a visible error and exactly twelve synthetic records', () => {
  const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'dashboard/demo-data.js'),'utf8'),context);
  const summary=Core.summarize(context.window.PHISHING_DEMO_DATA.map(Core.normalizeRecord));assert.equal(summary.total,12);assert.equal(summary.high,4);assert.equal(summary.medium,3);assert.equal(summary.low,4);assert.equal(summary.error,1);
});
test('input IDs are assigned before batching and paired items are present', () => {
  const input=Array.from({length:8},(_,i)=>({json:{'Email Text':'message '+i,'Email Type':'secret ground truth'}}));
  const normalized=node('normalize-csv',input);assert.equal(normalized[5].json.id,6);assert.equal(normalized[5].pairedItem.item,5);
  const analyzed=node('analyze-urls',normalized.slice(5));assert.equal(analyzed[0].json.lote[0].id,6);
  assert.equal(JSON.stringify(analyzed[0].json.prompt_lote).includes('secret ground truth'),false);
});
test('URL signals use the hostname rather than unrelated path/query text', () => {
  function signals(message){return node('analyze-urls',[{json:{id:1,mensagem:message}}])[0].json.lote[0];}
  assert.equal(signals('https://example.org/?ref=bit.ly&ip=192.0.2.1&email=a@b.example').url_suspeita,false);
  assert.equal(signals('https://bit.ly/example').url_suspeita,true);assert.equal(signals('http://192.0.2.1/path').url_suspeita,true);
  assert.equal(signals('https://account@example.org/').url_suspeita,true);
});
test('valid responses map by ID, preserving original text even if reordered', () => {
  const rows=normalized({text:JSON.stringify([{...result(7,10),mensagem:'altered'},result(6,90)])});
  assert.deepEqual(rows.map(r=>r.source_id),[6,7]);assert.equal(rows[0].mensagem,batch[0].mensagem);assert.equal(rows[1].classificacao,'BAIXO RISCO');
});
test('malformed, missing, provider errors and incomplete responses fail closed', () => {
  for(const response of [{},{error:'provider unavailable'},{text:'not json'},{text:'[]'},{text:JSON.stringify([result(6,0)])},{text:'prefix '+JSON.stringify([result(6,0),result(7,0)])}]) {
    const rows=normalized(response);assert.equal(rows.length,2);for(const row of rows){assert.equal(row.analysis_status,'analysis_error');assert.equal(row.score,null);assert.equal(row.suspeito,null);assert.equal(row.classificacao,'ERRO DE ANALISE');}
  }
});
test('duplicate, foreign and noninteger result IDs cannot misattribute messages', () => {
  for(const results of [[result(6,0),result(6,0)],[result(6,0),result(99,0)],[result('6',0),result(7,0)]]) assert.ok(normalized({text:JSON.stringify(results)}).every(row=>row.score===null));
});
test('invalid schema is not coerced into a safe result', () => {
  for(const change of [{score:null},{score:'0'},{score:-1},{score:101},{score:2.5},{confianca_ia:null},{suspeito:'false'},{motivos:[]},{analysis_status:'unknown'}]) {
    const rows=normalized({text:JSON.stringify([{...result(6,0),...change},result(7,0)])});assert.equal(rows[0].analysis_status,'analysis_error');assert.equal(rows[1].analysis_status,'ok');
  }
});
test('model abstention and empty messages stay unscored', () => {
  assert.equal(normalized({text:JSON.stringify([{id:6,analysis_status:'analysis_error'},result(7,0)])})[0].score,null);
  const rows=node('validate-response',[{json:{text:JSON.stringify([result(6,0),result(7,0)])}}],[{...batch[0],mensagem:''},batch[1]]);assert.equal(rows[0].json.error_reason,'empty_message');
});
test('workflow JSON has valid connections, safe defaults and exact source embedding', () => {
  const workflow=JSON.parse(fs.readFileSync(path.join(root,'workflow/phishing_detection_n8n.json'),'utf8'));
  const names=new Set(workflow.nodes.map(n=>n.name));assert.equal(names.size,workflow.nodes.length);assert.equal(workflow.active,false);
  for(const [source,outputs] of Object.entries(workflow.connections)) { assert.ok(names.has(source));for(const ports of Object.values(outputs))for(const edges of ports)for(const edge of edges)assert.ok(names.has(edge.node)); }
  assert.equal(workflow.connections['Extract CSV'].main[0][0].node,'Normalize CSV');assert.equal(workflow.connections['Normalize CSV'].main[0][0].node,'Loop Over Items');
  const chain=workflow.nodes.find(n=>n.name==='Classify Batch');assert.equal(chain.onError,'continueRegularOutput');assert.ok(chain.parameters.text.includes('prompt_lote'));assert.ok(!chain.parameters.text.includes('label_real'));
  assert.ok(workflow.nodes.every(n=>!n.credentials&&!n.webhookId));
});
