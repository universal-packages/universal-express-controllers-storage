import { DynamicApi } from '@universal-packages/dynamic-api'
import { Storage, VersionBlobDescriptor } from '@universal-packages/storage'

import { CurrentStorage, ExpressControllersStorageOptions, StorageRoutes } from './types'

export const CURRENT_STORAGE: CurrentStorage = { api: null, instance: null, options: null }

export async function initialize(options: ExpressControllersStorageOptions, storage?: Storage): Promise<CurrentStorage> {
  if (!CURRENT_STORAGE.instance) {
    const routesOptions = { ...options.routes }
    const finalRoutesOptions: StorageRoutes = {
      retrieve: { enable: true, path: ':key/:filename', method: 'GET', ...routesOptions.retrieve }
    }

    CURRENT_STORAGE.options = { rootPath: 'storage', externalStrategy: 'redirect', urlHost: 'http://localhost', ...options, routes: finalRoutesOptions }
    CURRENT_STORAGE.instance = storage || new Storage(CURRENT_STORAGE.options)
    CURRENT_STORAGE.api = new DynamicApi({
      debug: CURRENT_STORAGE.options.debug,
      apiName: 'storage',
      namespace: 'storage',
      dynamicsLocation: CURRENT_STORAGE.options.dynamicsLocation
    })

    if (!storage) await CURRENT_STORAGE.instance.prepare()
    await CURRENT_STORAGE.api.loadDynamics()

    return CURRENT_STORAGE
  } else {
    throw new Error('Storage already initialized')
  }
}

export async function getKeyUrl(key: string, filename: string): Promise<string> {
  if (!CURRENT_STORAGE.instance) throw new Error('Storage not initialized')

  const uri = await CURRENT_STORAGE.instance.retrieveUri(key)

  if (uri.includes('http')) return uri

  const host = CURRENT_STORAGE.options.urlHost
  const rootPath = CURRENT_STORAGE.options.rootPath
  const path = CURRENT_STORAGE.options.routes.retrieve.path.replace(':key', key).replace(':filename', filename)

  return `${host}/${rootPath}/${path}`.replace(/([^:]\/)\/+/g, '$1')
}

export async function getVersionKeyUrl(key: string, filename: string, descriptor: VersionBlobDescriptor): Promise<string> {
  if (!CURRENT_STORAGE.instance) throw new Error('Storage not initialized')

  const uri = await CURRENT_STORAGE.instance.retrieveVersionUri(key, descriptor)

  if (uri.includes('http')) return uri

  const host = CURRENT_STORAGE.options.urlHost
  const rootPath = CURRENT_STORAGE.options.rootPath
  const path = CURRENT_STORAGE.options.routes.retrieve.path.replace(':key', key).replace(':filename', filename)
  const version = Storage.serializeVersionBlobDescriptor(descriptor)

  return `${host}/${rootPath}/${path}?version=${version}`.replace(/([^:]\/)\/+/g, '$1')
}
