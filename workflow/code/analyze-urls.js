// Lexical signals only: never fetch, resolve or open an address from a message.
const incoming = $input.all();
const lote = incoming.map(({ json: source }) => {
  const urls = source.mensagem.match(/https?:\/\/[^\s<>"']+/gi) || [];
  const reasons = new Set();
  for (const url of urls) {
    const authority = url.match(/^https?:\/\/([^/?#]+)/i)?.[1] || '';
    const hostPort = authority.split('@').pop().toLowerCase();
    const host = hostPort.startsWith('[') ? hostPort.split(']')[0] + ']' : hostPort.replace(/:\d+$/, '');
    if (authority.includes('@')) reasons.add('User information in URL authority');
    const ipv4 = host.split('.');
    if ((ipv4.length === 4 && ipv4.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)) || /^\[[0-9a-f:]+\]$/i.test(host)) reasons.add('IP-address URL');
    if (url.length > 100) reasons.add('URL longer than 100 characters');
    if (['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd'].some(domain => host === domain || host.endsWith('.' + domain))) reasons.add('URL shortener');
    if (/\.(xyz|top|tk|ml|ga|cf)$/.test(host)) reasons.add('Uncommon top-level domain');
  }
  return { ...source, urls, url_suspeita: reasons.size > 0, motivos_url: [...reasons] };
});
// Ground-truth labels are deliberately excluded from the model input.
const prompt_lote = lote.map(({ id, mensagem, urls, url_suspeita, motivos_url }) => ({ id, mensagem, urls, url_suspeita, motivos_url }));
return [{ json: { lote, prompt_lote }, pairedItem: incoming.map((_, item) => ({ item })) }];
