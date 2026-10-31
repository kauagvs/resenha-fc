# Resenha FC

Placar das partidas de futebol no videogame entre Felipe e Kauã: gols ao vivo, time de cada um,
série acumulada (vitórias, empates, gols, maior goleada, sequência) e histórico de partidas.

Projeto pessoal, feito por diversão.

## Modo 8-bit

O botão **8-BIT** no topo troca o visual para um aparelho portátil retrô: fonte bitmap, botões
de console com cantos em degrau, visor LCD e bipes de onda quadrada nos gols e no apito final.
A escolha fica salva no navegador. O visual inteiro está em `src/styles.css`, na seção
`[data-skin="pixel"]`; os componentes só recebem classes `ui-*` como ganchos.

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
  hooks/useSkin.ts       liga/desliga o modo 8-bit
  lib/blip.ts            bipes 8-bit (Web Audio)
  components/            Scoreboard, SeriesSummary, MatchHistory, ConfirmButton
  App.tsx
```

## Dados

Os dados ficam no `localStorage` do navegador onde o placar é usado. Use **Exportar backup**
para guardar um JSON e **Importar backup** para restaurar em outro aparelho.

Para sincronizar entre aparelhos no futuro, basta trocar a implementação de
`src/storage/matches.ts` por um backend (ex.: Supabase) — o resto do app não muda.
