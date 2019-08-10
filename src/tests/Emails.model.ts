import { fieldArray } from '../decorators'
import { FieldArrayType } from '../FieldArrayType'

import { required } from './utils'

class EmailsModel {
  @fieldArray({
    validate: [required]
  })
  emails = new FieldArrayType(['olefirenk@gmail.com'])
}

export default EmailsModel
