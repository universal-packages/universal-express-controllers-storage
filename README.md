# Express Controllers Storage

[![npm version](https://badge.fury.io/js/@universal-packages%2Fexpress-controllers-storage.svg)](https://www.npmjs.com/package/@universal-packages/express-controllers-storage)
[![Testing](https://github.com/universal-packages/universal-express-controllers-storage/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-express-controllers-storage/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-express-controllers-storage/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-express-controllers-storage)

[universal-storage](https://github.com/universal-packages/universal-storage) implementation on top of [universal-express-controllers](https://github.com/universal-packages/universal-express-controllers)

## Install

```shell
npm install @universal-packages/express-controllers-storage

npm install @universal-packages/express-controllers
```

## Global methods

#### **`initialize(options: Object, [authenticatableClass: AuthenticatableClass])`**

Initialize the storage api and the storage controller to prepare routing configuration before the `ExpressApp` runs. The storage controller is loaded automatically by `ExpressApp`.

```js
import { initialize } from '@universal-packages/express-controllers-storage'
import { ExpressApp } from '@universal-packages/express-controllers'
import User from './User'

await initialize({ dynamicsLocation: './src' }, User)

const app = new ExpressApp({ port: 3000 })
await app.prepare()
await app.run()
```

Now storage blobs a re being served in `storage/:key/:filename`

#### Options

`initialize` takes the same [options](https://github.com/universal-packages/universal-storage#options) as `Storage`.

Additionally takes the following ones:

- **`rootPath`** `String` `default: /storage`
  You can set the root of all storage routes, ex: `/files`
- **`routes`**
  - **`retrieve`**
    - **`enable`** `Boolean` `default: true`
      Enables the controller to expose this action
    - **`path`** `String` `default: /:key/:filename`
      Enables the customization of the route for this action
    - **`method`** `HTTPVerb` `default: GET`
      Lets customize the method to access this action
- **`debug`** `Boolean` `default: false`
  Enables the debug mode for the dynamics.
- **`dynamicsLocation`** `String`
  The location of the dynamics.

### Dynamics

If you need to allow blobs depending on different conditions, you can override dynamic `should-allow-access-blob` and return `true` or `false` depending on your conditions.

```js
import { Dynamic } from '@universal-packages/dynamic-api'

@Dynamic('should-allow-access-blob')
export default class ShouldAllowAccessBlobDynamic {
  async perform(payload): Promise<boolean> {
    const { request, key } = payload
    const currentUser = request.currentUser

    if (currentUser.canAccess(key)) {
      return true
    }

    return false
  }
}
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
