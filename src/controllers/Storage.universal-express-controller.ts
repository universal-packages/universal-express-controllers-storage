import { BaseController } from '@universal-packages/express-controllers'
import { Storage, VersionBlobDescriptor } from '@universal-packages/storage'
import mime from 'mime-types'

import { RegisterAction, RegisterController } from '../decorators'
import { CURRENT_STORAGE } from '../express-controllers-storage'

@RegisterController()
export default class StorageController extends BaseController {
  @RegisterAction('retrieve')
  public async retrieve(): Promise<any> {
    const { key, filename } = this.request.params
    const { version } = this.request.query
    const mimetype = filename ? mime.lookup(filename) || 'application/octet-stream' : 'application/octet-stream'

    if (version && !mimetype.includes('image')) {
      this.status('BAD_REQUEST').json({ message: 'Versioning is only supported for images' })
    } else {
      let versionBlobDescriptor: VersionBlobDescriptor

      if (version) {
        try {
          versionBlobDescriptor = Storage.parseVersionSlug(version as string)
        } catch {
          return this.status('BAD_REQUEST').json({ message: 'Version query parameter must be a valid version slug' })
        }
      }

      const should = await CURRENT_STORAGE.api.performDynamic('should-allow-access-blob', { request: this.request, key, version: versionBlobDescriptor })

      if (should) {
        let uri: string

        try {
          uri = versionBlobDescriptor ? await CURRENT_STORAGE.instance.retrieveVersionUri(key, versionBlobDescriptor) : await CURRENT_STORAGE.instance.retrieveUri(key)
        } catch {
          return this.status('NOT_FOUND')
        }

        if (CURRENT_STORAGE.options.externalStrategy === 'redirect' && uri.includes('http')) {
          return this.redirect(uri)
        } else {
          this.response.contentType(mimetype)

          const stream = versionBlobDescriptor
            ? await CURRENT_STORAGE.instance.retrieveVersionStream(key, versionBlobDescriptor)
            : await CURRENT_STORAGE.instance.retrieveStream(key)

          await new Promise((resolve, reject): void => {
            stream.on('error', reject)
            stream.on('end', resolve)
            stream.pipe(this.response)
          })
        }
      } else {
        this.status('FORBIDDEN')
      }
    }
  }
}
