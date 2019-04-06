import { observable } from 'mobx'

import { IFieldArrayConfig } from './decorators'
import { createFields, updateFieldValue } from './utils'
import { Form } from './Form'
import { IModel } from './interfaces'

export class FieldArray<T extends any, M extends any> {
  public form: Form<M>
  public map: typeof Array.prototype.map

  @observable
  public value: T[]
  private model?: IModel
  private depth: string[]

  constructor(field: IFieldArrayConfig, form: Form<M>, depth: string[]) {
    this.form = form
    this.depth = depth
    this.value = field.value
    if (typeof field.model === 'function') {
      this.model = new field.model()
    }

    if (field.value.length) {
      this.value = this.value.map((item, index) =>
        this.createItem(item, String(index))
      )
    } else {
      this.value = []
    }

    this.map = this.value.map
  }

  public push = (value: T) => {
    return this.value.push(this.createItem(value, String(this.value.length)))
  }

  private createItem = (value: T, name: string) => {
    const depth = [...this.depth, `[${name}]`]
    if (this.model) {
      return createFields(this.model, value, this.form, depth) as T
    } else {
      updateFieldValue(this.form, value, depth)
      return value
    }
  }
}
