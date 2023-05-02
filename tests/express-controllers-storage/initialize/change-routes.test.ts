import { ExpressApp } from '@universal-packages/express-controllers'
import fetch from 'node-fetch'
import { StorageRoutes, initialize } from '../../../src'
import { CURRENT_STORAGE } from '../../../src/express-controllers-storage'

const port = 4000 + Number(process.env['JEST_WORKER_ID'])

let app: ExpressApp
afterEach(async (): Promise<void> => {
  await app.stop()
})

describe('initialize', (): void => {
  describe('change-routes', (): void => {
    it('change routes ', async (): Promise<void> => {
      const routes: StorageRoutes = { retrieve: { path: '/deeper/:key' } }
      await initialize({ debug: true, dynamicsLocation: './tests/__fixtures__/dynamics', routes, rootPath: '/custom' })

      app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
      app.on('request/error', console.log)
      await app.prepare()
      await app.run()

      const key = await CURRENT_STORAGE.instance.store({ name: 'test.txt', data: Buffer.from('Hello') })

      const response = await fetch(`http://localhost:${port}/custom/deeper/${key}`)
      expect(response.status).not.toEqual(404)
    })
  })
})
