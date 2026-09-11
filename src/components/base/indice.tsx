/**
 * O ÍNDICE DAS OITO SEÇÕES.
 *
 * O briefing do Kick-off define uma estrutura mínima para o site da equipe, em
 * oito seções nomeadas. O conteúdo das oito já existia; o que não existia era
 * caminho até elas. Três tinham âncora, e quatro viviam dentro da sanfona de
 * uma semana, sem nenhum link apontando.
 *
 * POR QUE AQUI E NÃO NO CABEÇALHO. O cabeçalho foi desenhado para três
 * destinos, e com oito ele estoura a largura de 360px, que é a régua do teste.
 * Mas o motivo bom é outro: o índice na página é também a ORDEM DE LEITURA. Um
 * menu diz onde ir; uma lista numerada diz por onde começar, que é o que serve
 * a quem abre o site para avaliar.
 *
 * A numeração é a do briefing, de 01 a 08, de propósito: quem avalia está com
 * a lista dele na mão e procura por número.
 */
export const SECOES = [
  { numero: '01', rotulo: 'início', ancora: '#topo' },
  { numero: '02', rotulo: 'equipe', ancora: '#equipe' },
  { numero: '03', rotulo: 'desafio e problema', ancora: '#problema' },
  { numero: '04', rotulo: 'usuário', ancora: '#usuario' },
  { numero: '05', rotulo: 'solução', ancora: '#solucao' },
  { numero: '06', rotulo: 'processo', ancora: '#processo' },
  { numero: '07', rotulo: 'cronograma', ancora: '#cronograma' },
  { numero: '08', rotulo: 'documentos', ancora: '#documentos' },
] as const

export function Indice() {
  return (
    <nav aria-label="Seções do site">
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
        {SECOES.map((secao) => (
          <li key={secao.ancora} className="bloco-raso -mt-px -ml-px">
            <a href={secao.ancora} className="group block">
              <span className="ordinal">{secao.numero}</span>
              <span className="fonte-display mt-1.5 block text-sm lowercase group-hover:text-acento">
                {secao.rotulo}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
