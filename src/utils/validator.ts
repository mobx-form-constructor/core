import { Field } from '../Field'
import { ValidateType } from '../interfaces'

import { setIn } from './setIn'

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
        setIn(this.form.errors, error, this.depth)
        valid = false
      } else {
        this.error = ''
        setIn(this.form.errors, error, this.depth)
        valid = true
      }

      this.validating = false
    } catch (e) {
      this.validating = false
    }
  }

  return valid
}
