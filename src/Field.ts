import { action, observable, flow, computed } from 'mobx'
import equal from 'fast-deep-equal'

import { BaseField } from './BaseField'
import { IFieldConfig } from './interfaces'
import { Form } from './Form'
import { setIn, validator, createNormalizer } from './utils'
import { getValue } from './utils/getValue'

export class Field<T = any, M = any> extends BaseField<M> {
  @computed
  public get valid() {
    return !this.error
  }

  @computed
  public get invalid() {
    return !this.valid
  }

  // @observable
  // public autofilled

  @computed
  public get dirty() {
    return !this.pristine
  }

  @observable
  public value: T = ('' as any) as T

  public initial: T = ('' as any) as T

  @observable
  public active = false

  @observable
  public touched = false

  @observable
  public visited = false

  @computed
  get pristine() {
    return equal(this.value, this.initial)
  }

  public didChange?: (value: T, field: Field<T>) => any

  private normalize: (value: T, field: this) => T

  constructor(field: IFieldConfig<T>, form: Form<M>, depth: string[]) {
    super()

    if (typeof field.value !== 'undefined') {
      this.value = field.value
      this.initial = field.value
    }
    this.form = form
    this.depth = depth

    this.validate = action(flow(validator.bind(this, field.validate)))
    this.normalize = createNormalizer(field.normalize)
    this.didChange = field.didChange
  }

  public bind = () => ({
    onChange: this.onChange,
    onFocus: this.onFocus,
    onBlur: this.onBlur,
    value: this.value
  })

  public bindCheckbox = () => ({
    onChange: this.onChange,
    onFocus: this.onFocus,
    onBlur: this.onBlur,
    checked: this.value
  })

  public bindRadio = (value?: string) => ({
    onChange: this.onChange,
    onFocus: this.onFocus,
    onBlur: this.onBlur,
    checked: String(this.value) === String(value),
    value
  })

  @action
  public onChange = (e: any) => {
    const $value = getValue(e)

    this.value = this.normalize($value, this)

    if (this.value || typeof this.value === 'boolean' || this.form.valuesBehavior === 'keepEmpty') {
      setIn(this.form.values, this.value, this.depth)
    } else {
      setIn(this.form.values, undefined, this.depth)
    }

    if (!this.active) {
      this.touched = true
    }

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
    this.form.touched = true
    this.active = false
    this.form.validate()
  }

  @action
  public onFocus = () => {
    this.active = true
    this.visited = true
  }
}
