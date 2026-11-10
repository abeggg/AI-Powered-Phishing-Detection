(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PhishingCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX_ROWS = 10000;
  const labels = { high: 'High risk', medium: 'Medium risk', low: 'Low risk', error: 'Analysis error' };
  function riskFor(score) { return score >= 71 ? 'high' : score >= 40 ? 'medium' : 'low'; }
  function number(value) {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    if (typeof value === 'string' && !/^\d+(?:\.\d+)?$/.test(value.trim())) return null;
    const n = Number(value);
    return Number.isFinite(n) && Number.isInteger(n) && n >= 0 && n <= 100 ? n : null;
  }
  function normalizeRecord(input, index) {
    const field = (...names) => names.map(name => input[name]).find(value => value !== undefined && value !== null) ?? '';
    const message = String(field('Mensagem', 'mensagem', 'message'));
    if (message.length > 10000) throw new Error('A message exceeds 10,000 characters.');
    const score = number(field('Score', 'score'));
    const confidence = number(field('Confiabilidade', 'Confianca_IA', 'confianca_ia'));
    const status = String(field('analysis_status', 'Status')).toLowerCase().trim();
    const classification = String(field('Classificacao', 'classificacao')).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    let error = !message.trim() || score === null || !['', 'ok'].includes(status) || /ERRO|ERROR|REVIEW|FAILED/.test(classification);
    const known = { 'ALTO RISCO': 'high', 'HIGH RISK': 'high', 'MEDIO RISCO': 'medium', 'MEDIUM RISK': 'medium', 'BAIXO RISCO': 'low', 'LOW RISK': 'low' };
    if (classification && (!known[classification] || known[classification] !== riskFor(score))) error = true;
    const reasons = field('Motivos', 'motivos', 'reasons');
    return { id: index + 1, message, score: error ? null : score, confidence: error ? null : confidence,
      risk: error ? 'error' : riskFor(score), reasons: Array.isArray(reasons) ? reasons.join('; ') : String(reasons),
      timestamp: String(field('Timestamp', 'timestamp', 'created_at')), errorReason: error ? String(field('error_reason') || 'Invalid or unavailable analysis') : '' };
  }
  function parseCSV(text) {
    if (typeof text !== 'string' || text.length > 5 * 1024 * 1024) throw new Error('CSV must be no larger than 5 MB.');
    text = text.replace(/^\uFEFF/, '');
    const rows = []; let row = [], value = '', quoted = false, closed = false;
    function finishField() { row.push(value); value = ''; closed = false; }
    function finishRow() { finishField(); if (row.some(cell => cell.trim())) rows.push(row); row = []; if (rows.length > MAX_ROWS + 1) throw new Error('CSV exceeds 10,000 records.'); }
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') { value += '"'; i++; }
        else if (char === '"') { quoted = false; closed = true; }
        else value += char;
      } else if (char === '"') {
        if (value || closed) throw new Error('Invalid CSV quotation.');
        quoted = true;
      } else if (char === ',') finishField();
      else if (char === '\n' || char === '\r') { finishRow(); if (char === '\r' && text[i + 1] === '\n') i++; }
      else if (closed) throw new Error('Unexpected content after a quoted CSV field.');
      else value += char;
    }
    if (quoted) throw new Error('CSV contains an unclosed quoted field.');
    if (value || closed || row.length) finishRow();
    if (rows.length < 2) throw new Error('CSV needs a header and at least one record.');
    const headers = rows.shift().map(header => header.trim());
    if (new Set(headers).size !== headers.length || headers.some(header => !header)) throw new Error('CSV headers must be nonempty and unique.');
    if (!headers.some(header => ['Mensagem', 'mensagem', 'message'].includes(header))) throw new Error('CSV requires a Mensagem or message column.');
    return rows.map((cells, index) => {
      if (cells.length !== headers.length) throw new Error('CSV row ' + (index + 2) + ' has the wrong number of columns.');
      const object = Object.create(null); headers.forEach((header, i) => { object[header] = cells[i]; });
      return normalizeRecord(object, index);
    });
  }
  function select(records, { query = '', risk = 'all', sort = 'risk-desc' } = {}) {
    const search = query.trim().toLocaleLowerCase();
    const selected = records.filter(record => (risk === 'all' || record.risk === risk) && (!search || (record.message + ' ' + record.reasons).toLocaleLowerCase().includes(search)));
    return selected.sort((a, b) => {
      if (sort === 'newest') return (Date.parse(b.timestamp) || 0) - (Date.parse(a.timestamp) || 0);
      if (a.score === null || b.score === null) return a.score === b.score ? a.id - b.id : a.score === null ? 1 : -1;
      return sort === 'risk-asc' ? a.score - b.score || a.id - b.id : b.score - a.score || a.id - b.id;
    });
  }
  function summarize(records) {
    const counts = { high: 0, medium: 0, low: 0, error: 0 };
    records.forEach(record => counts[record.risk]++);
    const valid = records.filter(record => record.score !== null);
    const confidence = valid.filter(record => record.confidence !== null);
    const mean = (list, key) => list.length ? Math.round(list.reduce((sum, item) => sum + item[key], 0) / list.length) : null;
    return { ...counts, total: records.length, analyzed: valid.length, average: mean(valid, 'score'), confidence: mean(confidence, 'confidence') };
  }
  function validateFeed(value) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || url.username || url.password || !/^\/spreadsheets\/d\//.test(url.pathname)) throw new Error('Use an HTTPS Google Sheets public CSV export.');
    if (!url.pathname.endsWith('/pub') && !url.pathname.endsWith('/export')) throw new Error('Use a published CSV endpoint, not a spreadsheet editor URL.');
    if (url.searchParams.get('output') !== 'csv' && url.searchParams.get('format') !== 'csv') throw new Error('The Sheets endpoint must export CSV.');
    return url.href;
  }
  return { labels, riskFor, normalizeRecord, parseCSV, select, summarize, validateFeed };
});
