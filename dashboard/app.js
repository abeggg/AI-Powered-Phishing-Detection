(function () {
  'use strict';
  const Core = window.PhishingCore;
  const byId = id => document.getElementById(id);
  const PAGE_SIZE = 100;
  const MAX_BYTES = 5 * 1024 * 1024;
  let records = [], page = 0, requestId = 0, controller;
  const sheet = window.PHISHING_DASHBOARD_CONFIG?.sheetsCsvUrl || '';
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = String(text);
    if (className) node.className = className;
    return node;
  }
  function badge(record) { return element('span', Core.labels[record.risk], 'badge ' + record.risk); }
  function note(message) { byId('notice').textContent = message; byId('notice').hidden = !message; }
  function setData(next, source, status) {
    records = next; page = 0; byId('source').textContent = source; byId('status').textContent = status; note(''); render();
  }
  function details(record) {
    const body = byId('details-body'); body.replaceChildren(badge(record));
    body.append(element('h3', 'Message'), element('p', record.message), element('h3', 'Analysis'), element('p', record.score === null ? 'Unscored · human review required' : 'Risk score: ' + record.score + '/100'), element('h3', 'Reasons'), element('p', record.reasons || 'No explanation supplied.'));
    if (record.errorReason) body.append(element('h3', 'Analysis status'), element('p', record.errorReason));
    if (record.confidence !== null) body.append(element('h3', 'Model confidence'), element('p', record.confidence + '% · self-reported and not calibrated.'));
    byId('details').showModal();
  }
  function viewButton(record) { const button = element('button', 'View', 'record-link'); button.type = 'button'; button.setAttribute('aria-label', 'View message ' + record.id); button.addEventListener('click', () => details(record)); return button; }
  function render() {
    const stats = Core.summarize(records);
    for (const key of ['total', 'high', 'medium', 'low', 'error']) byId(key).textContent = stats[key];
    byId('average').textContent = stats.average === null ? '—' : stats.average + '/100';
    byId('confidence').textContent = stats.confidence === null ? '—' : stats.confidence + '%';
    byId('distribution').replaceChildren();
    for (const risk of ['high', 'medium', 'low', 'error']) {
      const row = element('div', undefined, 'distribution-row ' + risk), bar = element('progress');
      bar.max = Math.max(stats.total, 1); bar.value = stats[risk]; bar.setAttribute('aria-label', Core.labels[risk]);
      row.append(element('span', Core.labels[risk]), bar, element('span', stats[risk] + ' · ' + (stats.total ? Math.round(stats[risk] / stats.total * 100) : 0) + '%'));
      byId('distribution').append(row);
    }
    byId('priority').replaceChildren();
    const top = Core.select(records).filter(record => record.score !== null).slice(0, 3);
    top.forEach(record => {
      const card = element('div', undefined, 'priority-item'), content = element('div');
      content.append(badge(record), element('p', record.message), viewButton(record));
      card.append(content, element('span', record.score, 'score ' + record.risk)); byId('priority').append(card);
    });
    if (!top.length) byId('priority').append(element('p', 'No successfully analyzed messages available.', 'empty'));
    const selected = Core.select(records, { query: byId('search').value, risk: byId('risk-filter').value, sort: byId('sort').value });
    const start = page * PAGE_SIZE, visible = selected.slice(start, start + PAGE_SIZE);
    byId('result-count').textContent = selected.length + ' of ' + records.length + ' records';
    byId('records').replaceChildren();
    visible.forEach(record => {
      const row = element('tr'), riskCell = element('td'), messageCell = element('td', undefined, 'message'), actionCell = element('td');
      riskCell.append(badge(record)); messageCell.append(element('p', record.message)); actionCell.append(viewButton(record));
      const date = Date.parse(record.timestamp);
      const formatted = Number.isFinite(date) ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(date) + ' UTC' : 'Not supplied';
      row.append(riskCell, element('td', record.score === null ? '—' : record.score, 'number'), messageCell, element('td', formatted, 'time'), actionCell);
      byId('records').append(row);
    });
    byId('empty').hidden = selected.length !== 0;
    byId('page-label').textContent = selected.length ? (start + 1) + '–' + Math.min(start + PAGE_SIZE, selected.length) + ' of ' + selected.length : '0 records';
    byId('previous').disabled = page === 0; byId('next').disabled = start + PAGE_SIZE >= selected.length;
  }
  function cancelPending() { requestId++; if (controller) controller.abort(); }
  function demo() { cancelPending(); byId('csv-file').value = ''; setData(window.PHISHING_DEMO_DATA.map(Core.normalizeRecord), 'Synthetic demo', '12 fictional records · no credentials or model calls'); }
  async function readLimited(response) {
    const reader = response.body.getReader(); let size = 0; const chunks = [];
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BYTES) { await reader.cancel(); throw new Error('Remote CSV exceeds 5 MB.'); } chunks.push(value); }
    const result = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; } return new TextDecoder('utf-8', { fatal: true }).decode(result);
  }
  async function refresh() {
    if (!sheet) return;
    cancelPending(); const current = requestId; const aborter = new AbortController(); controller = aborter; const timeout = setTimeout(() => aborter.abort(), 12000);
    byId('status').textContent = 'Loading the configured public feed…';
    try {
      const url = Core.validateFeed(sheet);
      const response = await fetch(url, { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: aborter.signal });
      if (!response.ok) throw new Error('The public feed could not be read.');
      const next = Core.parseCSV(await readLimited(response));
      if (current === requestId) setData(next, 'Public Google Sheets CSV', next.length + ' public records loaded · refresh is manual');
    } catch {
      if (current === requestId) { byId('status').textContent = 'Feed refresh failed · the previous data remains visible'; note('Could not read the public CSV feed. Check its publication and format, or import a local CSV.'); }
    } finally { clearTimeout(timeout); }
  }
  byId('load-demo').addEventListener('click', demo);
  byId('import-csv').addEventListener('click', () => byId('csv-file').click());
  byId('csv-file').addEventListener('change', async event => {
    const file = event.target.files?.[0]; if (!file) return;
    cancelPending(); const current = requestId;
    try {
      if (file.size > MAX_BYTES) throw new Error('CSV must be no larger than 5 MB.');
      const next = Core.parseCSV(await file.text());
      if (current === requestId) setData(next, 'Local CSV', next.length + ' records imported · file contents stay in this browser');
    } catch (error) { if (current === requestId) note(error.message + ' Previous data was kept.'); }
    event.target.value = '';
  });
  byId('refresh-sheet').disabled = !sheet; byId('refresh-sheet').addEventListener('click', refresh);
  if (sheet) byId('refresh-sheet').title = 'Read the configured public CSV feed';
  byId('search').addEventListener('input', () => { page = 0; render(); });
  for (const id of ['risk-filter', 'sort']) byId(id).addEventListener('change', () => { page = 0; render(); });
  byId('previous').addEventListener('click', () => { page--; render(); }); byId('next').addEventListener('click', () => { page++; render(); });
  byId('close-details').addEventListener('click', () => byId('details').close());
  demo();
})();
