import { action, observable, flow, computed } from 'mobx'
import equal from 'fast-deep-equal'

import { BaseField } from './BaseField'
import { IFieldConfig } from './interfaces'
import { Form } from './Form'
import { setIn, validator, createNormalizer } from './utils'

export class Field<T = any, M = any> extends BaseField {
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

  @observable
  public error = ''

  @observable
  public validating = false

  @computed
  get pristine() {
    return equal(this.value, this.initial)
  }

  @action
  public validate: () => Promise<boolean>

  public form: Form<M>

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
    value: this.value,
    error: this.error
  })

  public bindCheckbox = () => ({
    onChange: this.onChange,
    onFocus: this.onFocus,
    onBlur: this.onBlur,
    error: this.error,
    checked: this.value
  })

  public bindRadio = (value?: string) => ({
    onChange: this.onChange,
    onFocus: this.onFocus,
    onBlur: this.onBlur,
    error: this.error,
    checked: String(this.value) === String(value),
    value
  })

  @action
  public onChange = (e: any) => {
    let $value

    if (e && e.target) {
      $value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    } else {
      $value = e
    }

    this.value = this.normalize($value, this)

    setIn(this.form.values, this.value, this.depth)

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
    this.active = false
    this.form.validate()
  }

  @action
  public onFocus = () => {
    this.active = true
    this.visited = true
  }
}
