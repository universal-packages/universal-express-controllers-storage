import { Dynamic } from '@universal-packages/dynamic-api'

import { ShouldAllowAccessBlobPayload, StorageDynamicNames } from '../types'

@Dynamic<StorageDynamicNames>('should-allow-access-blob', true)
export default class ShouldAllowAccessBlobDynamic {
  public async perform(_payload: ShouldAllowAccessBlobPayload): Promise<boolean> {
    return true
  }
}
