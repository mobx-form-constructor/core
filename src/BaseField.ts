import { computed } from 'mobx'

import { isArrayKey } from './utils'

export abstract class BaseField {
  public depth: string[]

  @computed
  public get key() {
    return this.depth.reduce((acc: string, item) => {
      if (isArrayKey.test(item)) {
        return acc + item
      }
      return acc ? acc + '.' + item : item
    }, '')
  }
}
