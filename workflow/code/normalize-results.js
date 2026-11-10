return $input.all().map((item, index) => {
  const result = item.json;
  const valid = result.analysis_status === 'ok' && Number.isInteger(result.score) && result.score >= 0 && result.score <= 100 && Number.isInteger(result.confianca_ia) && result.confianca_ia >= 0 && result.confianca_ia <= 100;
  return { json: { source_id: result.id, mensagem: result.mensagem,
    analysis_status: valid ? 'ok' : 'analysis_error', error_reason: valid ? null : (result.error_reason || 'invalid_schema'),
    score: valid ? result.score : null, confianca_ia: valid ? result.confianca_ia : null,
    suspeito: valid ? result.score >= 40 : null,
    classificacao: !valid ? 'ERRO DE ANALISE' : result.score >= 71 ? 'ALTO RISCO' : result.score >= 40 ? 'MEDIO RISCO' : 'BAIXO RISCO',
    motivos: Array.isArray(result.motivos) ? result.motivos.join('; ') : 'Analysis unavailable. Human review required.',
    timestamp: new Date().toISOString(), model: 'llama-3.3-70b-versatile', prompt_version: 'portfolio-v1' }, pairedItem: { item: index } };
});
