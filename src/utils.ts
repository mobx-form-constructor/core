import {
  IModel,
  IFieldConfig,
  ValidateType,
  FieldsType,
  NormalizeType
} from './interfaces'
import { Field } from './Field'
import { FieldArray } from './FieldArray'
import { $fields, IFieldArrayConfig } from './decorators'
import { Form } from './Form'
import DefaultModel from './Default.model'

export function createFields(
  model: IModel,
  initialValues: any,
  form: Form,
  $depth: string[] = []
) {
  const fields = {}

  for (const fieldName in model[$fields]) {
    if (Object.hasOwnProperty.call(model[$fields], fieldName)) {
      const depth = fieldName ? $depth.concat(fieldName) : $depth

      const field: any = model[$fields][fieldName]
      field.value = model[fieldName]

      if (initialValues) {
        const value = fieldName ? initialValues[fieldName] : initialValues
        if (value !== undefined) {
          field.value = value
        }
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

export const isArrayKey = /\[(\d+)\]/

export function updateFieldValue(form: Form, value: any, depth: string[]) {
  depth.reduce((acc: any, key, index, array) => {
    const result = isArrayKey.exec(key)

    if (result) {
      key = result[1]
    }

    if (array.length - index === 1) {
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
        this.error = error
        valid = false
      } else {
        valid = true
        this.error = ''
      }

      this.validating = false
    } catch (e) {
      this.validating = false
    }
  }

  return valid
}

export type ValidatorsType = Array<() => Promise<boolean> | boolean>

export function composeValidators(
  fields: FieldsType<any>,
  validators: ValidatorsType = []
) {
  for (const key in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      const field = fields[key]

      if (field instanceof Field) {
        validators.push(field.validate)
      }

      if (field instanceof FieldArray) {
        validators.push(field.validate)
        if (field.model instanceof DefaultModel) {
          for (const f of field.value) {
            validators.push(f[''].validate)
          }
        } else {
          for (const f of field.value) {
            validators.push(...composeValidators(f as FieldsType<any>))
          }
        }
      }
    }
  }

  return validators
}

export function* formValidator(this: Form) {
  let valid = true

  for (const v of this.validators) {
    const isValidField: boolean = yield v()

    if (!isValidField) {
      valid = false
    }
  }

  this.valid = valid
}

export function createNormalizer<T, M>(
  normalizer?: NormalizeType<T, M> | Array<NormalizeType<T, M>>
) {
  return (value: T, field: Field<T, M>) => {
    if (normalizer) {
      const normalizers = Array.isArray(normalizer) ? normalizer : [normalizer]

      let $value: T = value

      for (const fn of normalizers) {
        $value = fn(value, field)
      }

      return $value
    }

    return value
  }
}
