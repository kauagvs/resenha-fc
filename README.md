# Resenha FC

Placar das partidas de futebol no videogame entre Felipe e Kauã: gols ao vivo, time de cada um,
série acumulada (vitórias, empates, gols, maior goleada, sequência) e histórico de partidas.

Projeto pessoal, feito por diversão.

## Dias e narração

- **Placar do dia:** as partidas são agrupadas por dia, e quem vence mais partidas no dia
  "ganha o dia". O painel **Hoje** mostra quem está na frente, a série conta os **dias
  vencidos** e o histórico vem separado por dia. Partidas antes das 5h contam para o dia
  anterior, para uma resenha que vira a madrugada continuar sendo o mesmo dia.
- **Narração:** grito de gol de narrador ("Gooool! Gol, gol, gol! É do Kauã! 2 a 1 para o
  Kauã.") com rugido de torcida, gol anulado e fim de jogo com a situação do dia. Liga e
  desliga no botão **Narração**.
- **Regra da quitada:** abriu 3 gols de diferença (3×0, 4×1...), a partida acaba: os gols
  travam, aparece o selo **QUITADA!** e a narração anuncia. Liga e desliga no próprio placar;
  a escolha vale para os dois aparelhos. Com a regra ligada, o histórico marca as partidas
  quitadas e a série conta as quitadas de cada um.

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
  lib/voice.ts           narração por voz (Web Speech API)
  lib/crowd.ts           rugido de torcida (Web Audio)
  hooks/useVoice.ts      liga/desliga a narração
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
