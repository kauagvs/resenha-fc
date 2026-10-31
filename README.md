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
  storage/store.ts       escolhe onde salvar (online no claude.ai ou localStorage)
  storage/cloud.ts       banco online da página no claude.ai
  storage/matches.ts     localStorage, backup em JSON e leitura dos dados salvos
  hooks/useScoreboard.ts estado e ações do placar
  hooks/useSkin.ts       liga/desliga o modo 8-bit
  lib/blip.ts            bipes 8-bit (Web Audio)
  components/            Scoreboard, SeriesSummary, MatchHistory, ConfirmButton
  App.tsx
```

## Onde os dados ficam

- **Rodando local (`bun run dev`) ou em qualquer site:** no `localStorage` do navegador. Use
  **Exportar backup** / **Importar backup** para levar o histórico para outro aparelho.
- **Publicado no claude.ai:** no banco online da página, então o placar é o mesmo em qualquer
  aparelho. O backup some nesse modo porque não é necessário.

O app escolhe sozinho (`src/storage/store.ts`): se `window.claude` existir, usa o banco online
(`src/storage/cloud.ts`); senão, o `localStorage` (`src/storage/matches.ts`).

## Publicar no claude.ai

```sh
bun run build:artifact
```

Gera `dist-artifact/resenha-fc.html` (build num arquivo só, no formato de página do claude.ai).
É esse arquivo que vai para https://claude.ai/artifact/Jrt8dXbjWafZjEDhowBvWG — o GitHub é a
fonte, a página é só o resultado do build.
