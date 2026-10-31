# Resenha FC

Placar das partidas de futebol no videogame entre Felipe e Kauã: gols ao vivo, time de cada um,
série acumulada (vitórias, empates, gols, maior goleada, sequência) e histórico de partidas.

Projeto pessoal, feito por diversão.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4 (tokens em `src/styles.css`, bloco `@theme`)

## Rodando

```sh
bun install
bun run dev
```

`bun run build` gera a versão estática em `dist/` (pode ser publicada em qualquer host estático).

## Estrutura

```
src/
  domain/match.ts        tipos (Match, LiveMatch) e cálculo da série
  storage/matches.ts     persistência (localStorage) + backup em JSON
  hooks/useScoreboard.ts estado e ações do placar
  components/            Scoreboard, SeriesSummary, MatchHistory, ConfirmButton
  App.tsx
```

## Dados

Os dados ficam no `localStorage` do navegador onde o placar é usado. Use **Exportar backup**
para guardar um JSON e **Importar backup** para restaurar em outro aparelho.

Para sincronizar entre aparelhos no futuro, basta trocar a implementação de
`src/storage/matches.ts` por um backend (ex.: Supabase) — o resto do app não muda.
