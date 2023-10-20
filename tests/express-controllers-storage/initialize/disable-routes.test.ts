import { ExpressApp } from '@universal-packages/express-controllers'

import { StorageRoutes, initialize } from '../../../src'

const port = 4000 + Number(process.env['JEST_WORKER_ID'])

let app: ExpressApp
afterEach(async (): Promise<void> => {
  await app.stop()
})

describe(initialize, (): void => {
  describe('disable-routes', (): void => {
    it('disable routes if configured', async (): Promise<void> => {
      const routes: StorageRoutes = { retrieve: { enable: false } }
      await initialize({ debug: true, dynamicsLocation: './tests/__fixtures__/dynamics', routes })

      app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
      app.on('request/error', console.log)
      await app.prepare()
      await app.run()

      await fPatch('storage/mykey/test.txt')
      expect(fResponse).toHaveReturnedWithStatus('NOT_FOUND')
    })
  })
})
