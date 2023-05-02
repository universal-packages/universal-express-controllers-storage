import { StorageRoutes, initialize, getKeyUrl } from '../../src'
import { CURRENT_STORAGE } from '../../src/express-controllers-storage'

describe('getKeyUrl', (): void => {
  it('uses options to generate a url to the controller ', async (): Promise<void> => {
    const routes: StorageRoutes = { retrieve: { path: '/deeper/:key/:filename' } }
    await initialize({ debug: true, dynamicsLocation: './tests/__fixtures__/dynamics', routes, rootPath: '/custom', urlHost: 'https://universal-packages.com' })

    const key = await CURRENT_STORAGE.instance.store({ name: 'test.txt', data: Buffer.from('Hello') })

    expect(await getKeyUrl(key, 'test.txt')).toEqual(`https://universal-packages.com/custom/deeper/${key}/test.txt`)
  })
})
