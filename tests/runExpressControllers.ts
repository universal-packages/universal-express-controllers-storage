import { ExpressControllers } from '@universal-packages/express-controllers'

let currentApp: ExpressControllers

declare global {
  function runExpressControllers(debugError?: boolean): Promise<ExpressControllers>
}

global.runExpressControllers = async function setAppLocation(debugError?: boolean): Promise<ExpressControllers> {
  currentApp = new ExpressControllers({ appLocation: './tests/__fixtures__', port: fDefaultPort })

  if (debugError) currentApp.on('request/error', console.log)

  await currentApp.prepare()
  await currentApp.run()

  return currentApp
}

afterEach(async (): Promise<void> => {
  if (currentApp) currentApp.stop()

  currentApp = undefined
})
