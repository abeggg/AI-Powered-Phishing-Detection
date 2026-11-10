// Run once for all items, before batching, so identifiers never reset per batch.
return $input.all().map((item, index) => {
  const message = item.json['Email Text'];
  if (typeof message !== 'string') throw new Error('CSV requires an Email Text column.');
  if (message.length > 10000) throw new Error('A message exceeds the 10,000-character input limit.');
  return { json: { id: index + 1, mensagem: message, label_real: String(item.json['Email Type'] || '') }, pairedItem: { item: index } };
});
