import { IModel, IFieldConfig, ValidateType } from './interfaces'
import { Field } from './Field'
import { FieldArray } from './FieldArray'
import { $fields, IFieldArrayConfig } from './decorators'
import { Form } from './Form'

export function createFields(
  model: IModel,
  initialValues: any,
  form: Form,
  $depth: string[] = []
) {
  const fields = {}

  for (const fieldName in model[$fields]) {
    if (Object.hasOwnProperty.call(model[$fields], fieldName)) {
      const depth = $depth.concat(fieldName)
      const field: any = model[$fields][fieldName]
      field.value = model[fieldName]

      if (initialValues && initialValues[fieldName] !== undefined) {
        field.value = initialValues[fieldName]
      }

      if (
        typeof model[fieldName] === 'object' &&
        !Array.isArray(model[fieldName])
      ) {
        fields[fieldName] = createFields(
          model[fieldName],
          field.value,
          form,
          depth
        )
      } else {
        if (field.type === 'field') {
          if (typeof field.value === 'undefined') {
            field.value = ''
          }
          updateFieldValue(form, field.value, depth)
          fields[fieldName] = new Field(field as IFieldConfig, form, depth)
        }

        if (field.type === 'fieldArray') {
          if (typeof field.value === 'undefined') {
            field.value = []
          }
          updateFieldValue(form, field.value, depth)
          fields[fieldName] = new FieldArray(
            field as IFieldArrayConfig,
            form,
            depth
          )
        }
      }
    }
  }

  return fields
}

const isArrayKey = /\[(\d+)\]/

export function updateFieldValue(form: Form, value: any, depth: string[]) {
  depth.reduce((acc: any, key, index, array) => {
    const result = isArrayKey.exec(key)

    if (result) {
      key = result[1]
    }

    if (array.length - 1 === index) {
      acc[key] = value
    } else {
      if (result && !acc[key]) {
        acc[key] = {}
      }

      return acc[key]
    }
  }, form.values)
}

export function* validator(
  this: Field,
  validate?: ValidateType | ValidateType[]
) {
  let valid: boolean = true
  if (validate) {
    try {
      this.validating = true

      let error
      if (Array.isArray(validate)) {
        for (const v of validate) {
          error = yield v(this)
          if (error) break
        }
      } else {
        error = yield validate(this)
      }

      if (error) {
        this.setError(error)
        valid = false
      } else {
        valid = true
        this.setError('')
      }

      this.validating = false
    } catch (e) {
      this.validating = false
    }
  }

  return valid
}
