import { observable, action, flow } from 'mobx'

import { BaseField } from './BaseField'
import { createFields, validator } from './utils'
import { Form } from './Form'
import { IModel, FieldsType, IFieldArrayConfig } from './interfaces'
import DefaultModel from './Default.model'
import { Field } from './Field'

type ValueType<T> = T extends object ? FieldsType<T> : Field<T>

export class FieldArray<T extends any = any, M extends any = any> extends BaseField {
  @observable
  public value: Array<ValueType<T>> = []

  public model: IModel

  constructor(field: IFieldArrayConfig<T, M>, form: Form<M>, depth: string[]) {
    super()

    this.form = form
    this.depth = depth

    this.validate = action(flow(validator.bind(this, field.validate, false)))

    this.model = new field.model()

    if (field.value.length) {
      this.value = field.value.map((item, index) => this.createItem(item, String(index)))
    } else {
      this.value = []
    }
  }

  public map = <U>(callbackfn: (value: ValueType<T>, index: number, array: Array<ValueType<T>>) => U): U[] => {
    if (this.model instanceof DefaultModel) {
      return this.value.map((value, index, array) => callbackfn(value[''], index, array))
    } else {
      return this.value.map(callbackfn)
    }
  }

  public push = (value: T) => {
    return this.value.push(this.createItem(value, String(this.value.length)))
  }

  private createItem = (value: T, name: string): any => {
    const depth = [...this.depth, `[${name}]`]

    return createFields(this.model, value, this.form, depth) as T
  }
}
