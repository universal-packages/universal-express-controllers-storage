import { Storage } from '@universal-packages/storage'
import { CurrentStorage, ExpressControllersStorageOptions, StorageRoutes } from './types'
import { DynamicApi } from '@universal-packages/dynamic-api'

export const CURRENT_STORAGE: CurrentStorage = { api: null, instance: null, options: null }

export async function initialize(options: ExpressControllersStorageOptions, storage?: Storage): Promise<CurrentStorage> {
  if (!CURRENT_STORAGE.instance) {
    const routesOptions = { ...options.routes }
    const finalRoutesOptions: StorageRoutes = {
      retrieve: { enable: true, path: ':key/:filename', method: 'GET', ...routesOptions.retrieve }
    }

    CURRENT_STORAGE.options = { rootPath: 'storage', externalStrategy: 'redirect', ...options, routes: finalRoutesOptions }
    CURRENT_STORAGE.instance = storage || new Storage(CURRENT_STORAGE.options)
    CURRENT_STORAGE.api = new DynamicApi({
      debug: CURRENT_STORAGE.options.debug,
      apiName: 'storage',
      namespace: 'storage',
      dynamicsLocation: CURRENT_STORAGE.options.dynamicsLocation
    })

    if (!storage) await CURRENT_STORAGE.instance.initialize()
    await CURRENT_STORAGE.api.loadDynamics()

    return CURRENT_STORAGE
  } else {
    throw new Error('Storage already initialized')
  }
}
