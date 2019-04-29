import { action, observable, flow, computed } from 'mobx'

import { IFieldConfig } from './interfaces'
import { Form } from './Form'
import {
  updateFieldValue,
  validator,
  isArrayKey,
  createNormalizer
} from './utils'

export class Field<T = any, M = any> {
  @computed
  public get valid() {
    return !this.error
  }

  @computed
  public get invalid() {
    return !this.valid
  }

  @computed
  public get key() {
    return this.depth.reduce((acc: string, item) => {
      if (isArrayKey.test(item)) {
        return acc + item
      }
      return acc + '.' + item
    }, '')
  }
  @observable
  public value: T = ('' as any) as T
  @observable
  public active = false
  @observable
  public touched = false
  @observable
  public visited = false
  @observable
  public error = ''
  @observable
  public validating = false

  @action
  public validate: () => Promise<boolean>

  public form: Form<M>

  private depth: string[]

  private didChange?: (value: T, field: Field<T>) => any

  private normalize: (value: T, field: this) => T

  constructor(field: IFieldConfig<T>, form: Form<M>, depth: string[]) {
    if (typeof field.value !== 'undefined') {
      this.value = field.value
    }
    this.form = form
    this.depth = depth

    this.validate = action(flow(validator.bind(this, field.validate)))
    this.normalize = createNormalizer(field.normalize)
    this.didChange = field.didChange
  }

  @action
  public onChange = (e: any) => {
    this.value = this.normalize(e.target.value, this)
    updateFieldValue(this.form, this.value, this.depth)
    this.touched = true
    this.form.validate()

    if (this.didChange) {
      this.didChange(this.value, this)
    }

    if (this.form.didChange) {
      this.form.didChange(this.key, this.value, this.form)
    }
  }

  @action
  public onBlur = () => {
    this.touched = true
    this.active = false
    this.form.validate()
  }

  @action
  public onFocus = () => {
    this.active = true
  }

  public bind = () => {
    return {
      onChange: this.onChange,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      value: this.value
    }
  }

  public setError = (value: string) => {
    this.error = value
  }
}
