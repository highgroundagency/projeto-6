# O pitch do Kick-off, em arquivos

O original é a rota **`/pitch`** do site, liberada pelo motor de releases junto com o ciclo
`ko`. O que está aqui é derivado dela, para o dia em que a rede falhar:

| Arquivo | O que é |
| --- | --- |
| `../pitch-kickoff.pdf` | Os nove slides, uma página cada, 16:9, no tema escuro do site |
| `../pitch-kickoff.md` | O roteiro corrigido, a fala de cada slide, o material de apoio e as pendências |
| `../../public/pitch/slide-01.png` … `slide-09.png` | A captura de cada slide, 1280 × 720 |
| `../../public/pitch/memoria.png` | A memória de cálculo da demonstração; é a reserva que o slide 4 mostra se a demonstração ao vivo falhar |

As capturas ficam em `public/` e não aqui porque a página as serve: a reserva do slide 4 é a
mesma imagem, sem binário duplicado.

## Regerar

```bash
npm run build
npm run pitch-pdf
```

O script sobe o servidor de produção, entra com sessão de admin, abre `/pitch` e avança com a
seta, como no palco. Depois, `npm run dossie` se o `package.json` tiver mudado.

## Apresentar

Abra `/pitch` no site. Setas avançam e voltam; `n` abre as notas do apresentador, com quem
fala, o tempo do slide e o cronômetro; `f` põe em tela cheia. Uma pessoa opera; quem fala não
opera. Detalhes em `../pitch-kickoff.md`.
