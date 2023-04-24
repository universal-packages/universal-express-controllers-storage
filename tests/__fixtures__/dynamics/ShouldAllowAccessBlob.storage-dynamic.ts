import { Dynamic } from '@universal-packages/dynamic-api'
import { ShouldAllowAccessBlobPayload, StorageDynamicNames } from '../../../src'

@Dynamic<StorageDynamicNames>('should-allow-access-blob')
export default class ShouldAllowAccessBlobDynamic {
  public static allow = true

  public async perform(_payload: ShouldAllowAccessBlobPayload): Promise<boolean> {
    return ShouldAllowAccessBlobDynamic.allow
  }
}
