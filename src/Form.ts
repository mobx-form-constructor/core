import { observable, flow, computed, action } from 'mobx'

import { IFormConfig, FieldsType, IModel } from './interfaces'
import {
  createFields,
  composeValidators,
  ValidatorsType,
  formValidator
} from './utils'

export type ModelConstructorType<T extends any = any> = new () => T

export class Form<T extends any = {}, R extends any = {}> {
  public fields: FieldsType<T>
  @observable
  public values: T = {} as T
  public initialValues?: Partial<T>

  @observable
  public submitting = false

  @observable
  public submitted = false

  @observable
  public submitFailed = false

  public handleSubmit = flow(
    function* handleSubmit(this: Form<T>, e: any) {
      e.preventDefault()
      const { onSubmit, onSubmitSuccess, onSubmitFail } = this

      if (!onSubmit) return

      try {
        yield this.validate()
        if (!this.valid) {
          this.submitFailed = true
          if (onSubmitFail) onSubmitFail({}, this)
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
        this.submitted = true
        this.submitFailed = true
        if (onSubmitFail) onSubmitFail(e, this)
      }
    }.bind(this)
  )

  @observable
  public valid = true

  @action
  public validate = flow(formValidator.bind(this))

  private onSubmit?: (form: Form<T>) => Promise<R>
  private onSubmitSuccess?: (result: R, form: Form<T>) => any
  private onSubmitFail?: (error: R, form: Form<T>) => any

  @computed
  public get validators(): ValidatorsType {
    return composeValidators(this.fields)
  }
  // private didChange?: (form: Form<T>) => any

  constructor(FormModel: ModelConstructorType<T>, config: IFormConfig<T, R>) {
    this.initialValues = config.initialValues
    this.onSubmit = config.onSubmit
    this.onSubmitSuccess = config.onSubmitSuccess
    this.onSubmitFail = config.onSubmitFail

    const model = new FormModel() as IModel & T
    this.fields = createFields(model, this.initialValues, this) as FieldsType<T>
  }
}
