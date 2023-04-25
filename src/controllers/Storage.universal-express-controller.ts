import { BaseController } from '@universal-packages/express-controllers'
import mime from 'mime-types'
import { RegisterAction, RegisterController } from '../decorators'
import { CURRENT_STORAGE } from '../initialize'

@RegisterController()
export default class StorageController extends BaseController {
  @RegisterAction('retrieve')
  public async connectProvider(): Promise<any> {
    const { key, filename } = this.request.params

    const should = await CURRENT_STORAGE.api.performDynamic('should-allow-access-blob', { request: this.request, key })

    if (should) {
      const uri = await CURRENT_STORAGE.instance.retrieveUri(key)

      // Local storage returns undefined if file does not exists
      if (uri) {
        if (CURRENT_STORAGE.options.externalStrategy === 'redirect' && uri.includes('http')) {
          this.redirect(uri)
        } else {
          if (filename) this.response.contentType(mime.lookup(filename) || 'application/octet-stream')

          const stream = await CURRENT_STORAGE.instance.retrieveStream(key)

          await new Promise((resolve, reject): void => {
            stream.on('error', reject)
            stream.on('end', resolve)
            stream.pipe(this.response)
          })
        }
      } else {
        this.status('NOT_FOUND')
      }
    } else {
      this.status('FORBIDDEN')
    }
  }
}
