import { ExpressApp } from '@universal-packages/express-controllers'

let currentApp: ExpressApp

declare global {
  function runExpressApp(debugError?: boolean): Promise<ExpressApp>
}

global.runExpressApp = async function setAppLocation(debugError?: boolean): Promise<ExpressApp> {
  currentApp = new ExpressApp({ appLocation: './tests/__fixtures__', port: fDefaultPort })

  if (debugError) currentApp.on('request/error', console.log)

  await currentApp.prepare()
  await currentApp.run()

  return currentApp
}

afterEach(async (): Promise<void> => {
  if (currentApp) currentApp.stop()

  currentApp = undefined
})
