# Resenha FC

Placar das partidas de futebol no videogame entre Felipe e Kauã. Projeto pessoal, uma página só,
sem servidor. Publicado como Artifact no claude.ai: https://claude.ai/artifact/Jrt8dXbjWafZjEDhowBvWG

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · Motion (`motion/react`) ·
canvas-confetti · lucide-react · Vitest · ESLint · Prettier. Gerenciador: **bun**.

## Comandos

```sh
bun install
bun run dev              # servidor local (dados no localStorage)
bun run check            # typecheck + lint + format:check + testes — rode antes de commitar
bun run build:artifact   # gera dist-artifact/resenha-fc.html, o arquivo publicado no claude.ai
```

## Estrutura

- `src/domain/` regras puras (sem React): resultado, quitada, dias, estatísticas. Tem testes.
- `src/storage/` onde o placar fica salvo. `store.ts` escolhe: banco online do Artifact
  (`cloud.ts`, quando `window.claude` existe) ou `localStorage` (`matches.ts`).
- `src/hooks/` estado e preferências (placar, 8-bit, narração, comemoração).
- `src/lib/` efeitos sem React: voz (Web Speech), torcida e bipes (Web Audio), fogos, formatação.
- `src/components/` UI. Imports entre pastas usam o atalho `@/`.

## Regras do projeto

- **Nunca apagar nem reescrever partidas salvas.** O banco online tem partidas reais em dois
  formatos (`{ f, k, at }` da primeira versão e `{ score, clubs, playedAt }` atual). Os parsers
  em `storage/` aceitam os dois; mudança de formato = parser tolerante, não migração.
  Tudo que é derivado (dia, quitada, estatísticas) é calculado na leitura.
- Interface e comentários em **português**; nomes de código em inglês.
- Regra nova de jogo vai em `domain/` com teste em `*.test.ts`.
- O modo 8-bit é só CSS: `src/styles.css`, seção `[data-skin="pixel"]`, apoiada nas classes
  `ui-*` dos componentes. Componentes não sabem do 8-bit, exceto onde a animação muda
  (passos em vez de mola).
- Animações respeitam "reduzir movimento" (`MotionConfig reducedMotion="user"` e
  `disableForReducedMotion` nos confetes).
- Fuso: os dias usam o fuso do aparelho, com virada às 5h. Testes rodam em America/Sao_Paulo.
