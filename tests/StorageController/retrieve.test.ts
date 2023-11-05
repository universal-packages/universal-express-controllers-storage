import { Storage } from '@universal-packages/storage'
import fs from 'fs'

import { initialize } from '../../src'
import { CURRENT_STORAGE } from '../../src/express-controllers-storage'
import ShouldAllowAccessBlobDynamic from '../__fixtures__/dynamics/ShouldAllowAccessBlob.storage-dynamic'

beforeAll(async (): Promise<void> => {
  await initialize({ debug: true, dynamicsLocation: './tests/__fixtures__/dynamics' })
})

describe('StorageController', (): void => {
  describe('retrieve', (): void => {
    describe('when accessing a retrievable blob', (): void => {
      it('returns ok and the blob', async (): Promise<void> => {
        await runExpressApp()

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.txt', data: Buffer.from('Hello') })

        await fGet(`storage/${key}/test.txt`)

        expect(fResponse).toHaveReturnedWithStatus('OK')
        expect(fResponse.headers.get('content-type')).toEqual('text/plain; charset=utf-8')
        expect(fResponseBody).toEqual('Hello')
      })
    })

    describe('when blob does not exists', (): void => {
      it('returns not found', async (): Promise<void> => {
        await runExpressApp()

        await fGet('storage/nop/test.txt')
        expect(fResponse).toHaveReturnedWithStatus('NOT_FOUND')
      })
    })

    describe('when should allow dynamic returns false', (): void => {
      beforeEach((): void => {
        ShouldAllowAccessBlobDynamic.allow = false
      })

      afterEach((): void => {
        ShouldAllowAccessBlobDynamic.allow = true
      })

      it('returns forbidden', async (): Promise<void> => {
        await runExpressApp()

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.txt', data: Buffer.from('Hello') })

        await fGet(`storage/${key}/test.txt`)
        expect(fResponse).toHaveReturnedWithStatus('FORBIDDEN')
      })
    })

    describe('when accessing a retrievable version blob', (): void => {
      it('returns ok and the blob', async (): Promise<void> => {
        await runExpressApp()

        const image = fs.readFileSync('./tests/__fixtures__/images/test.128.png')

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.png', data: image })
        await CURRENT_STORAGE.instance.storeVersion(key, { name: 'test.png', width: 64 })
        const versionSlug = Storage.serializeVersionBlobDescriptor({ width: 64 })

        await fGet(`storage/${key}/test.png?version=${versionSlug}`)

        expect(fResponse).toHaveReturnedWithStatus('OK')
        expect(fResponse.headers.get('content-type')).toEqual('image/png')
        expect(fResponseBody).toEqual(await CURRENT_STORAGE.instance.retrieveVersion(key, { width: 64 }))
      })
    })

    describe('when version blob does not exists', (): void => {
      it('returns not found', async (): Promise<void> => {
        await runExpressApp()

        const image = fs.readFileSync('./tests/__fixtures__/images/test.128.png')

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.png', data: image })
        await CURRENT_STORAGE.instance.storeVersion(key, { name: 'test.png', width: 64 })
        const versionSlug = Storage.serializeVersionBlobDescriptor({ width: 32 })

        await fGet(`storage/${key}/test.png?version=${versionSlug}`)

        expect(fResponse).toHaveReturnedWithStatus('NOT_FOUND')
      })
    })

    describe('when version is request from a non image', (): void => {
      it('returns bad request', async (): Promise<void> => {
        await runExpressApp()

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.txt', data: Buffer.from('Hello') })
        const versionSlug = Storage.serializeVersionBlobDescriptor({ width: 32 })

        await fGet(`storage/${key}/test.txt?version=${versionSlug}`)
        expect(fResponse).toHaveReturnedWithStatus('BAD_REQUEST')
      })
    })

    describe('when version slug is malformed', (): void => {
      it('returns bad request', async (): Promise<void> => {
        await runExpressApp()

        const image = fs.readFileSync('./tests/__fixtures__/images/test.128.png')

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.png', data: image })
        await CURRENT_STORAGE.instance.storeVersion(key, { name: 'test.png', width: 64 })

        await fGet(`storage/${key}/test.png?version=8*8`)
        expect(fResponse).toHaveReturnedWithStatus('BAD_REQUEST')
      })
    })
  })
})
