import { ValidateType } from '../interfaces'
import { Field } from '../Field'
import { FieldArray } from '../FieldArray'

import { setIn } from './setIn'

export function* validator(this: Field | FieldArray, validate?: ValidateType | ValidateType[], putError = true) {
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
        if (putError) {
          setIn(this.form.errors, error, this.depth)
        }
        valid = false
      } else {
        this.error = ''
        if (putError) {
          setIn(this.form.errors, undefined, this.depth)
        }
        valid = true
      }

      this.validating = false
    } catch (e) {
      this.validating = false
    }
  }

  return valid
}
