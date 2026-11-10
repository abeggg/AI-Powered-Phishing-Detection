// Fictional scores and messages for interface demonstration, not measured model output.
window.PHISHING_DEMO_DATA = [
  { Mensagem: 'Sua conta será bloqueada hoje. Envie sua senha e o código de verificação.', Score: 96, Confiabilidade: 94, Motivos: 'Credential request; urgency and account-blocking threat', Timestamp: '2026-06-10T10:12:00Z' },
  { Mensagem: 'Nosso fornecedor mudou de banco. Faça a transferência agora e não telefone para confirmar.', Score: 89, Confiabilidade: 90, Motivos: 'Bank-detail change; request to bypass independent verification', Timestamp: '2026-06-10T10:11:00Z' },
  { Mensagem: 'Você ganhou um prêmio inesperado. Informe os dados do cartão para receber.', Score: 94, Confiabilidade: 91, Motivos: 'Unexpected reward; request for financial information', Timestamp: '2026-06-10T10:10:00Z' },
  { Mensagem: 'Confirme seu acesso em https://account.example.invalid/login e envie o código recebido.', Score: 85, Confiabilidade: 88, Motivos: 'Verification-code request; unfamiliar destination', Timestamp: '2026-06-10T10:09:00Z' },
  { Mensagem: 'Atualize seu cadastro pelo link enviado. Temos um prazo curto para concluir a revisão.', Score: 63, Confiabilidade: 76, Motivos: 'Unusual update request; limited context', Timestamp: '2026-06-10T10:08:00Z' },
  { Mensagem: 'Oferta especial de software, válida somente hoje. Confira as condições.', Score: 44, Confiabilidade: 72, Motivos: 'Sales pressure; insufficient evidence of fraud', Timestamp: '2026-06-10T10:07:00Z' },
  { Mensagem: 'Recebemos uma solicitação em seu nome. Responda para confirmar os próximos passos.', Score: 52, Confiabilidade: 70, Motivos: 'Unclear sender context; unexpected confirmation request', Timestamp: '2026-06-10T10:06:00Z' },
  { Mensagem: 'Olá, nossa reunião foi confirmada para amanhã às 10h.', Score: 9, Confiabilidade: 86, Motivos: 'Routine scheduling; no sensitive request', Timestamp: '2026-06-10T10:05:00Z' },
  { Mensagem: 'A documentação pública está disponível em https://example.org/docs.', Score: 14, Confiabilidade: 85, Motivos: 'Informational content; no urgent action', Timestamp: '2026-06-10T10:04:00Z' },
  { Mensagem: 'Segue o cronograma revisado para a próxima semana.', Score: 7, Confiabilidade: 87, Motivos: 'Routine project update', Timestamp: '2026-06-10T10:03:00Z' },
  { Mensagem: 'Obrigado pelo retorno. Enviaremos a ata após a reunião.', Score: 4, Confiabilidade: 89, Motivos: 'Routine conversation', Timestamp: '2026-06-10T10:02:00Z' },
  { Mensagem: 'Mensagem de teste cuja análise não ficou disponível.', Score: null, Confiabilidade: null, analysis_status: 'analysis_error', error_reason: 'provider_error', Motivos: 'Analysis unavailable. Human review required.', Timestamp: '2026-06-10T10:01:00Z' }
];
