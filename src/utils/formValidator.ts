import { Form } from '../Form'

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
