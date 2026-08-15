import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { driverArquivo } from './driver-arquivo'
import { driverMemoria } from './driver-memoria'
import { configPadrao, descreverMudancas, type ConfigSite } from './tipos'

const RELOGIO = () => '2026-08-15T12:00:00.000Z'

describe('configPadrao', () => {
  it('cai no adiantamento de 7 dias sem env var', () => {
    const config = configPadrao({} as NodeJS.ProcessEnv)
    expect(config.adiantamentoDias).toBe(7)
    expect(config.overrideRelease).toBeNull()
    expect(config.travas).toEqual({})
  })

  it('lê adiantamento e override do ambiente', () => {
    const config = configPadrao({
      RELEASE_ADIANTAMENTO_DIAS: '14',
      RELEASE_OVERRIDE: 'sr1',
    } as NodeJS.ProcessEnv)
    expect(config.adiantamentoDias).toBe(14)
    expect(config.overrideRelease).toBe('sr1')
  })

  it('ignora env var com lixo em vez de derrubar o site', () => {
    const config = configPadrao({
      RELEASE_ADIANTAMENTO_DIAS: 'muitos',
      RELEASE_OVERRIDE: 's99',
      RELEASE_TRAVAS: '{isso nao e json',
    } as NodeJS.ProcessEnv)
    expect(config.adiantamentoDias).toBe(7)
    expect(config.overrideRelease).toBeNull()
    expect(config.travas).toEqual({})
  })

  it('recusa adiantamento fora da faixa aceita', () => {
    expect(
      configPadrao({ RELEASE_ADIANTAMENTO_DIAS: '-5' } as NodeJS.ProcessEnv)
        .adiantamentoDias,
    ).toBe(7)
    expect(
      configPadrao({ RELEASE_ADIANTAMENTO_DIAS: '9999' } as NodeJS.ProcessEnv)
        .adiantamentoDias,
    ).toBe(7)
  })

  it('lê travas em JSON e descarta ciclo inexistente', () => {
    const config = configPadrao({
      RELEASE_TRAVAS: '{"s9":"sempre_visivel","xx":"sempre_oculto"}',
    } as NodeJS.ProcessEnv)
    expect(config.travas).toEqual({ s9: 'sempre_visivel' })
  })
})

describe('descreverMudancas', () => {
  const base: ConfigSite = {
    adiantamentoDias: 7,
    overrideRelease: null,
    travas: {},
    atualizadoEm: '',
  }

  it('registra mudança de adiantamento', () => {
    const mudancas = descreverMudancas(base, { ...base, adiantamentoDias: 14 })
    expect(mudancas).toEqual([{ campo: 'adiantamentoDias', de: '7', para: '14' }])
  })

  it('descreve override em linguagem humana', () => {
    expect(descreverMudancas(base, { ...base, overrideRelease: 'sr1' })).toEqual([
      { campo: 'overrideRelease', de: 'automático', para: 'sr1' },
    ])
    expect(
      descreverMudancas({ ...base, overrideRelease: 'sr1' }, base),
    ).toEqual([{ campo: 'overrideRelease', de: 'sr1', para: 'automático' }])
  })

  it('registra trava por ciclo nos dois sentidos', () => {
    const comTrava = { ...base, travas: { s9: 'sempre_visivel' } } as ConfigSite
    expect(descreverMudancas(base, comTrava)).toEqual([
      { campo: 'trava:s9', de: 'automatico', para: 'sempre_visivel' },
    ])
    expect(descreverMudancas(comTrava, base)).toEqual([
      { campo: 'trava:s9', de: 'sempre_visivel', para: 'automatico' },
    ])
  })

  it('não registra nada quando nada mudou', () => {
    expect(descreverMudancas(base, { ...base, atualizadoEm: 'outro' })).toEqual([])
  })
})

describe('driverMemoria', () => {
  it('grava e relê a configuração', async () => {
    const store = driverMemoria(configPadrao({} as NodeJS.ProcessEnv), RELOGIO)
    await store.gravar({ adiantamentoDias: 21 }, 'admin')
    expect((await store.ler()).adiantamentoDias).toBe(21)
  })

  it('aceita voltar o override para automático', async () => {
    const store = driverMemoria(configPadrao({} as NodeJS.ProcessEnv), RELOGIO)
    await store.gravar({ overrideRelease: 'sr2' }, 'admin')
    expect((await store.ler()).overrideRelease).toBe('sr2')
    await store.gravar({ overrideRelease: null }, 'admin')
    expect((await store.ler()).overrideRelease).toBeNull()
  })

  it('recusa valor inválido', async () => {
    const store = driverMemoria(configPadrao({} as NodeJS.ProcessEnv), RELOGIO)
    await expect(store.gravar({ adiantamentoDias: -1 }, 'admin')).rejects.toThrow()
    await expect(
      store.gravar({ overrideRelease: 'inexistente' as never }, 'admin'),
    ).rejects.toThrow()
  })

  it('registra o histórico do mais novo para o mais antigo', async () => {
    const store = driverMemoria(configPadrao({} as NodeJS.ProcessEnv), RELOGIO)
    await store.gravar({ adiantamentoDias: 14 }, 'admin')
    await store.gravar({ overrideRelease: 'sr1' }, 'admin')

    const log = await store.historico()
    expect(log).toHaveLength(2)
    expect(log[0].campo).toBe('overrideRelease')
    expect(log[1]).toMatchObject({ campo: 'adiantamentoDias', de: '7', para: '14', autor: 'admin' })
  })

  it('não devolve referência interna mutável', async () => {
    const store = driverMemoria(configPadrao({} as NodeJS.ProcessEnv), RELOGIO)
    const lida = await store.ler()
    lida.travas.s9 = 'sempre_visivel'
    expect((await store.ler()).travas).toEqual({})
  })
})

describe('driverArquivo', () => {
  let pasta: string
  let caminho: string

  beforeEach(async () => {
    pasta = await mkdtemp(join(tmpdir(), 'prumo-config-'))
    caminho = join(pasta, 'config-site.json')
  })

  afterEach(async () => {
    await rm(pasta, { recursive: true, force: true })
  })

  it('parte dos padrões quando o arquivo não existe', async () => {
    const store = driverArquivo(caminho, RELOGIO)
    expect((await store.ler()).adiantamentoDias).toBe(configPadrao().adiantamentoDias)
  })

  it('persiste entre instâncias diferentes do driver', async () => {
    await driverArquivo(caminho, RELOGIO).gravar(
      { adiantamentoDias: 21, travas: { s9: 'sempre_visivel' } },
      'admin',
    )
    const outraInstancia = driverArquivo(caminho, RELOGIO)
    const config = await outraInstancia.ler()
    expect(config.adiantamentoDias).toBe(21)
    expect(config.travas).toEqual({ s9: 'sempre_visivel' })
    expect((await outraInstancia.historico())[0].campo).toBe('adiantamentoDias')
  })

  it('cria a pasta se ela não existir', async () => {
    const aninhado = join(pasta, 'a', 'b', 'config.json')
    await driverArquivo(aninhado, RELOGIO).gravar({ adiantamentoDias: 0 }, 'admin')
    expect(JSON.parse(await readFile(aninhado, 'utf8')).config.adiantamentoDias).toBe(0)
  })

  it('sobrevive a arquivo corrompido caindo nos padrões', async () => {
    await writeFile(caminho, 'isso não é json', 'utf8')
    const store = driverArquivo(caminho, RELOGIO)
    expect((await store.ler()).adiantamentoDias).toBe(7)
  })

  it('carimba a data da alteração', async () => {
    const store = driverArquivo(caminho, RELOGIO)
    const config = await store.gravar({ adiantamentoDias: 14 }, 'admin')
    expect(config.atualizadoEm).toBe(RELOGIO())
  })
})
