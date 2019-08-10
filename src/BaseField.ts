import { computed, observable, action } from 'mobx'

import { isArrayKey } from './utils'
import { Form } from './Form'

export abstract class BaseField<F = {}> {
  public depth: string[]

  public form: Form<F>

  @computed
  public get key() {
    return this.depth.reduce((acc: string, item) => {
      if (isArrayKey.test(item)) {
        return acc + item
      }
      return acc ? acc + '.' + item : item
    }, '')
  }

  @observable
  public error = ''

  @observable
  public validating = false

  @action
  public validate: () => Promise<boolean>
}
