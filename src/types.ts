import { DynamicApi } from '@universal-packages/dynamic-api'
import { HTTPVerb } from '@universal-packages/express-controllers'
import { Storage, StorageOptions, VersionBlobDescriptor } from '@universal-packages/storage'
import { Request } from 'express'

export type RouteName = 'retrieve'

export interface ExpressControllersStorageOptions extends StorageOptions {
  debug?: boolean
  dynamicsLocation: string
  urlHost?: string
  rootPath?: string
  routes?: StorageRoutes
  externalStrategy?: 'redirect' | 'proxy'
}

export type StorageRoutes = {
  [route in RouteName]?: StorageRoute
}

export interface StorageRoute {
  enable?: boolean
  method?: HTTPVerb
  path?: string
}

export interface CurrentStorage {
  api: DynamicApi<StorageDynamicNames>
  instance: Storage
  options: ExpressControllersStorageOptions
}

export interface StorageDynamicNames {
  'should-allow-access-blob': { payload: ShouldAllowAccessBlobPayload; result: boolean }
  zz__ignore: { payload: Record<string, any>; result: any }
}

export interface ShouldAllowAccessBlobPayload {
  request: Request
  key: string
  version?: VersionBlobDescriptor
}
