# O pitch do Kick-off, em arquivos

O original é a rota **`/pitch`** do site, liberada pelo motor de releases junto com o ciclo
`ko`. O que está aqui é derivado dela, para o dia em que a rede falhar.

| Arquivo | O que é | Servido pelo site? |
| --- | --- | --- |
| `../../public/pitch-kickoff.pdf` | Os nove slides, uma página cada, 16:9, no tema escuro | **Sim**, em `/pitch-kickoff.pdf`. É o botão "baixar pdf" do deck |
| `../pitch-kickoff.md` | O roteiro corrigido, a fala de cada slide, o material de apoio e as pendências | Não |
| `slide-01.png` … `slide-09.png` | A captura de cada slide, 1280 × 720 | **Não**, e é de propósito |

## Por que as capturas não são servidas

Elas já moraram em `public/`. Enquanto estavam lá, qualquer pessoa baixava o deck inteiro em
imagem mesmo nos dias em que `/pitch` respondia 404 por não estar liberado: o portão de
release vale para a rota, e arquivo estático não passa por rota. Nenhuma tela usa essas
imagens, então elas vieram para cá, que é documentação e não caminho público.

O PDF ficou em `public/` por decisão consciente, registrada na ADR-036: ele é a reserva de
quem apresenta sem rede, o link precisa funcionar sem JavaScript, e ele deriva de um ciclo já
liberado. A garantia do §6.3 continua valendo onde ela é verificável: HTML, payload RSC e
bundle do cliente.

## Regerar

```bash
npm run build
npm run pitch-pdf
```

O script sobe o servidor de produção, entra com sessão de admin, abre `/pitch` e avança com a
seta, como no palco.

## Apresentar

Abra `/pitch` no site. As setas passam o slide de qualquer lugar da página, `n` abre as notas
do apresentador com quem fala e o cronômetro, `f` põe em tela cheia e `p` imprime. Uma pessoa
opera; quem fala não opera. Detalhes em `../pitch-kickoff.md`.
