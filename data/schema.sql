-- Optional setup for a NEW, dedicated test database. Not a production migration.
-- This deliberately fails if an existing table has the same name.
create table public.analises_phishing (
  id bigint generated always as identity primary key,
  source_id bigint not null,
  mensagem text not null,
  analysis_status text not null check (analysis_status in ('ok','analysis_error')),
  error_reason text,
  score integer,
  confianca_ia integer,
  suspeito boolean,
  classificacao text not null,
  motivos text not null,
  timestamp timestamptz not null,
  model text not null,
  prompt_version text not null,
  constraint analysis_consistency check (
    (analysis_status = 'analysis_error' and score is null and confianca_ia is null and suspeito is null
      and classificacao = 'ERRO DE ANALISE' and error_reason is not null)
    or (analysis_status = 'ok' and score is not null and score between 0 and 100
      and confianca_ia is not null and confianca_ia between 0 and 100 and suspeito is not null
      and suspeito = (score >= 40) and error_reason is null
      and classificacao = case when score >= 71 then 'ALTO RISCO' when score >= 40 then 'MEDIO RISCO' else 'BAIXO RISCO' end)
  )
);
alter table public.analises_phishing enable row level security;
-- No browser-readable policies are created. Use a private server-side n8n credential.
