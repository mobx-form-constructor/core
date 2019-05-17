import { observable, flow, computed, action } from 'mobx'

import { IFormConfig, FieldsType, IModel, ErrorsType } from './interfaces'
import {
  createFields,
  composeValidators,
  ValidatorsType,
  formValidator
} from './utils'

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
  public fields: FieldsType<T>
  @observable
  public values: T = {} as T
  @observable
  public errors: Partial<ErrorsType<T>>

  public initialValues?: Partial<T>

  @observable
  public submitting = false

  @observable
  public submitted = false

  @observable
  public submitFailed = false

  public handleSubmit = flow(
    function* handleSubmit(this: Form<T>, e?: any) {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault()
      }

      const { onSubmit, onSubmitSuccess, onSubmitFail } = this

      if (!onSubmit) return

      try {
        if (this.pristine) {
          yield this.validate()
        }

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

  @computed
  public get pristine() {
    return this.pristineIdx === 0
  }

  @action
  public validate = flow(formValidator.bind(this))
  public error: any = ''

  public didChange?: (key: string, value: any, form: Form<T>) => any

  @observable
  public pristineIdx = 0

  private onSubmit?: (form: Form<T>) => Promise<R>
  private onSubmitSuccess?: (result: R, form: Form<T>) => any
  private onSubmitFail?: (error: R, form: Form<T>) => any

  private model: IModel & T

  constructor(FormModel: ModelConstructorType<T>, config?: IFormConfig<T, R>) {
    if (config) {
      this.initialValues = config.initialValues
      this.onSubmit = config.onSubmit
      this.onSubmitSuccess = config.onSubmitSuccess
      this.onSubmitFail = config.onSubmitFail
      this.didChange = config.didChange
    }

    this.model = new FormModel() as IModel & T
    this.fields = createFields(
      this.model,
      this.initialValues,
      this
    ) as FieldsType<T>

    this.errors = {}
  }

  public dirty = () => {
    return
  }

  public reset = () => {
    this.values = {} as T
    this.errors = {}
    this.error = ''
    this.valid = true
    this.submitFailed = false
    this.submitted = false
    this.submitting = false
    this.pristineIdx = 0

    this.fields = createFields(
      this.model,
      this.initialValues,
      this
    ) as FieldsType<T>
  }

  public setError = (error: any) => {
    this.error = error
  }
}
