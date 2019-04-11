import { action, observable, flow, computed } from 'mobx'

import { IFieldConfig } from './interfaces'
import { Form } from './Form'
import { updateFieldValue, validator } from './utils'

export class Field<T = any, M = any> {
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
    return this.depth.join('.')
  }

  @action
  public validate: () => Promise<boolean>

  public form: Form<M>

  private depth: string[]

  constructor(field: IFieldConfig<T>, form: Form<M>, depth: string[]) {
    if (typeof field.value !== 'undefined') {
      this.value = field.value
    }
    this.form = form
    this.depth = depth

    this.validate = action(flow(validator.bind(this, field.validate)))
  }

  @action
  public onChange = (e: any) => {
    this.value = e.target.value
    updateFieldValue(this.form, this.value, this.depth)
    this.touched = true
    this.form.validate()
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
