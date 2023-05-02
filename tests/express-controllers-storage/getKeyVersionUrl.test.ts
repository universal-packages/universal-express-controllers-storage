import fs from 'fs'
import { StorageRoutes, getVersionKeyUrl, initialize } from '../../src'
import { CURRENT_STORAGE } from '../../src/express-controllers-storage'

describe('getKeyVersionUrl', (): void => {
  it('uses options to generate a url to the controller ', async (): Promise<void> => {
    const routes: StorageRoutes = { retrieve: { path: '/deeper/:key/:filename' } }
    await initialize({ debug: true, dynamicsLocation: './tests/__fixtures__/dynamics', routes, rootPath: '/custom', urlHost: 'https://universal-packages.com' })

    const image = fs.readFileSync('./tests/__fixtures__/images/test.128.png')
    const key = await CURRENT_STORAGE.instance.store({ name: 'test.png', data: image })
    await CURRENT_STORAGE.instance.storeVersion(key, { name: 'test.png', width: 64 })

    expect(await getVersionKeyUrl(key, 'test.png', { width: 64 })).toEqual(`https://universal-packages.com/custom/deeper/${key}/test.png?version=v-64x~`)
  })
})
