import { ExpressApp } from '@universal-packages/express-controllers'

import { initialize } from '../../../src'

const port = 4000 + Number(process.env['JEST_WORKER_ID'])

describe('initialize', (): void => {
  it('throws an error if already initialized', async (): Promise<void> => {
    const app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
    app.on('request/error', console.log)
    try {
      await app.prepare()
    } catch {
      // No controllers loaded so namespace does not exist it throws an error for now check later when refined
    }

    await initialize({ debug: true, dynamicsLocation: './tests/__fixtures__/dynamics' })

    let error: Error

    try {
      await initialize({ debug: true, dynamicsLocation: './tests/__fixtures__/dynamics' })
    } catch (err) {
      error = err
    }

    expect(error.message).toEqual('Storage already initialized')
  })
})
