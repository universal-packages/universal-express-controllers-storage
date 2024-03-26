import { ExpressControllers } from '@universal-packages/express-controllers'

import { StorageRoutes, initialize } from '../../../src'
import { CURRENT_STORAGE } from '../../../src/express-controllers-storage'

const port = 4000 + Number(process.env['JEST_WORKER_ID'])

let app: ExpressControllers
afterEach(async (): Promise<void> => {
  await app.stop()
})

describe(initialize, (): void => {
  describe('change-routes', (): void => {
    it('change routes ', async (): Promise<void> => {
      const routes: StorageRoutes = { retrieve: { path: '/deeper/:key' } }
      // Remove this when node work well with fetch
      try {
        await initialize({ debug: true, dynamicsLocation: './tests/__fixtures__/dynamics', routes, rootPath: '/custom' })
      } catch {}

      app = new ExpressControllers({ appLocation: './tests/__fixtures__/controllers', port })
      app.on('request/error', console.log)
      await app.prepare()
      await app.run()

      const key = await CURRENT_STORAGE.instance.store({ name: 'test.txt', data: Buffer.from('Hello') })

      await fGet(`custom/deeper/${key}`)
      expect(fResponse).not.toHaveReturnedWithStatus('NOT_FOUND')
    })
  })
})
