import { observable, flow, computed, action } from 'mobx'
import equal from 'fast-deep-equal'

import { IFormConfig, FieldsType, IModel, ErrorsType, ValuesType } from './interfaces'
import { createFields, composeValidators, ValidatorsType, formValidator, setIn } from './utils'

export type ModelConstructorType<T extends any = any> = new () => T

export class Form<T extends any = {}, R extends any = {}> {
  @computed
  public get validators(): ValidatorsType {
    return composeValidators(this.fields)
  }

  @computed
  public get invalid() {
    return !this.valid
  }

  @computed
  public get pristine() {
    return equal(this.initialValues, this.values)
  }

  @computed
  public get dirty() {
    return !this.pristine
  }

  @observable
  public fields: FieldsType<T>

  @observable
  public values: ValuesType<T> = {} as ValuesType<T>

  @observable
  public errors: Partial<ErrorsType<T>> = {}

  public initialValues: Partial<ValuesType<T>> = {}

  @observable
  public submitting = false

  @observable
  public submitted = false

  @observable
  public submitFailed = false

  public name: string

  public handleSubmit = flow(
    function* handleSubmit(this: Form<T>, e?: any) {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault()
      }

      const { onSubmit, onSubmitSuccess, onSubmitFail } = this

      if (!onSubmit) return

      try {
        if (this.pristine || !this.touched) {
          yield this.validate()
        }
        this.touched = true
        if (!this.valid) {
          this.submitFailed = true
          if (onSubmitFail) onSubmitFail(this.errors, this)
          return
        }
        this.submitting = true
        const result = yield onSubmit(this)
        this.submitting = false
        this.submitted = true
        this.submitFailed = false
        if (onSubmitSuccess) onSubmitSuccess(result, this)
      } catch (e) {
        this.submitting = false
        this.submitted = false
        this.submitFailed = true
        if (onSubmitFail) onSubmitFail(e, this)
      }
    }.bind(this)
  )

  @observable
  public valid = true

  @action
  public validate = flow(formValidator.bind(this))

  @observable
  public error: any = ''

  public didChange?: (key: string, value: any, form: Form<T>) => any

  public valuesBehavior: 'keepEmpty' | 'removeEmpty' = 'keepEmpty'

  @observable
  public touched = false

  private onSubmit?: (form: Form<T>) => Promise<R>

  private onSubmitSuccess?: (result: R, form: Form<T>) => any

  private onSubmitFail?: (error: R, form: Form<T>) => any

  private model: IModel & T

  constructor(FormModel: ModelConstructorType<T>, config?: IFormConfig<T, R>) {
    this.name = FormModel.name

    if (config) {
      if (config.initialValues) {
        this.initialValues = config.initialValues
      }

      if (config.name) {
        this.name = config.name
      }

      if (config.valuesBehavior) {
        this.valuesBehavior = config.valuesBehavior
      }

      this.onSubmit = config.onSubmit
      this.onSubmitSuccess = config.onSubmitSuccess
      this.onSubmitFail = config.onSubmitFail
      this.didChange = config.didChange
    }

    this.model = new FormModel() as IModel & T
    this.fields = createFields(this.model, this.initialValues, this) as FieldsType<T>
  }

  @action
  public reset = (initialValues = this.initialValues) => {
    this.values = {} as ValuesType<T>
    this.errors = {}
    this.error = ''
    this.valid = true
    this.submitFailed = false
    this.submitted = false
    this.submitting = false
    this.touched = false

    this.fields = createFields(this.model, initialValues, this) as FieldsType<T>
  }

  @action
  public setError = (error: any) => {
    this.error = error
  }

  public updateValue = (value: any, depth: string[]) => {
    if (value || typeof value === 'boolean' || this.valuesBehavior === 'keepEmpty') {
      setIn(this.values, value, depth)
    } else {
      setIn(this.values, undefined, depth)
    }
  }
}
