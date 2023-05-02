import { ExpressApp } from '@universal-packages/express-controllers'
import fs from 'fs'
import fetch from 'node-fetch'
import { initialize } from '../../src'
import { CURRENT_STORAGE } from '../../src/express-controllers-storage'
import ShouldAllowAccessBlobDynamic from '../__fixtures__/dynamics/ShouldAllowAccessBlob.storage-dynamic'

const port = 4000 + Number(process.env['JEST_WORKER_ID'])

let app: ExpressApp
afterEach(async (): Promise<void> => {
  await app.stop()
  ShouldAllowAccessBlobDynamic.allow = true
})

beforeAll(async (): Promise<void> => {
  await initialize({ debug: true, dynamicsLocation: './tests/__fixtures__/dynamics' })
})

describe('StorageController', (): void => {
  describe('retrieve', (): void => {
    describe('when accessing a retrievable blob', (): void => {
      it('returns ok and the blob', async (): Promise<void> => {
        app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
        app.on('request/error', console.log)

        await app.prepare()
        await app.run()

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.txt', data: Buffer.from('Hello') })
        const response = await fetch(`http://localhost:${port}/storage/${key}/test.txt`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toEqual('text/plain; charset=utf-8')
        expect(response.body.read()).toEqual(Buffer.from('Hello'))
      })
    })

    describe('when blob does not exists', (): void => {
      it('returns not found', async (): Promise<void> => {
        app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
        app.on('request/error', console.log)

        await app.prepare()
        await app.run()

        const response = await fetch(`http://localhost:${port}/storage/nop/test.txt`)

        expect(response.status).toEqual(404)
      })
    })

    describe('when should allow dynamic returns false', (): void => {
      it('returns forbidden', async (): Promise<void> => {
        app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
        app.on('request/error', console.log)

        await app.prepare()
        await app.run()

        ShouldAllowAccessBlobDynamic.allow = false

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.txt', data: Buffer.from('Hello') })
        const response = await fetch(`http://localhost:${port}/storage/${key}/test.txt`)

        expect(response.status).toEqual(403)
      })
    })

    describe('when accessing a retrievable version blob', (): void => {
      it('returns ok and the blob', async (): Promise<void> => {
        app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
        app.on('request/error', console.log)

        await app.prepare()
        await app.run()

        const image = fs.readFileSync('./tests/__fixtures__/images/test.128.png')

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.png', data: image })
        await CURRENT_STORAGE.instance.storeVersion(key, { name: 'test.png', width: 64 })
        const versionSlug = CURRENT_STORAGE.instance.serializeVersionBlobDescriptor({ width: 64 })

        const response = await fetch(`http://localhost:${port}/storage/${key}/test.png?version=${versionSlug}`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toEqual('image/png')
        expect(response.body.read()).toEqual(await CURRENT_STORAGE.instance.retrieveVersion(key, { width: 64 }))
      })
    })

    describe('when version blob does not exists', (): void => {
      it('returns not found', async (): Promise<void> => {
        app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
        app.on('request/error', console.log)

        await app.prepare()
        await app.run()

        const image = fs.readFileSync('./tests/__fixtures__/images/test.128.png')

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.png', data: image })
        await CURRENT_STORAGE.instance.storeVersion(key, { name: 'test.png', width: 64 })
        const versionSlug = CURRENT_STORAGE.instance.serializeVersionBlobDescriptor({ width: 32 })

        const response = await fetch(`http://localhost:${port}/storage/${key}/test.png?version=${versionSlug}`)

        expect(response.status).toEqual(404)
      })
    })

    describe('when version is request from a non image', (): void => {
      it('returns bad request', async (): Promise<void> => {
        app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
        app.on('request/error', console.log)

        await app.prepare()
        await app.run()

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.txt', data: Buffer.from('Hello') })
        const versionSlug = CURRENT_STORAGE.instance.serializeVersionBlobDescriptor({ width: 32 })

        const response = await fetch(`http://localhost:${port}/storage/${key}/test.txt?version=${versionSlug}`)

        expect(response.status).toEqual(400)
      })
    })

    describe('when version slug is malformed', (): void => {
      it('returns bad request', async (): Promise<void> => {
        app = new ExpressApp({ appLocation: './tests/__fixtures__/controllers', port })
        app.on('request/error', console.log)

        await app.prepare()
        await app.run()

        const image = fs.readFileSync('./tests/__fixtures__/images/test.128.png')

        const key = await CURRENT_STORAGE.instance.store({ name: 'test.png', data: image })
        await CURRENT_STORAGE.instance.storeVersion(key, { name: 'test.png', width: 64 })

        const response = await fetch(`http://localhost:${port}/storage/${key}/test.png?version=8*8`)

        expect(response.status).toEqual(400)
      })
    })
  })
})
