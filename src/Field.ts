import { action, observable, flow, computed } from 'mobx'

import { IFieldConfig } from './interfaces'
import { Form } from './Form'
import {
  setIn,
  validator,
  isArrayKey,
  createNormalizer,
  shallowEqual
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
      return acc ? acc + '.' + item : item
    }, '')
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
  @observable
  public pristine = true

  @action
  public validate: () => Promise<boolean>

  public form: Form<M>

  public didChange?: (value: T, field: Field<T>) => any

  public depth: string[]

  private normalize: (value: T, field: this) => T

  constructor(field: IFieldConfig<T>, form: Form<M>, depth: string[]) {
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

    this.pristine = shallowEqual(this.value, this.initial)
    // if (change.object) {
    //   this.form.pristineIdx++
    // } else {
    //   this.form.pristineIdx--
    // }

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
