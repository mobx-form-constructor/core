import { field, fieldArray } from '../decorators'
import { FieldArrayType } from '../FieldArrayType'

import { minLength, required, trim, willThrowAnError } from './utils'
import Hobby from './Hobby.model'
import EmailsModel from './Emails.model'

class UserFormModel extends EmailsModel {
  @field({ validate: [required, minLength(3)] })
  login = 'alex'

  @field({ validate: [required, minLength(8)], normalize: [trim()] })
  password = 'password'

  @fieldArray()
  hobbies = new FieldArrayType(Hobby, [{ hobbyId: 1, hobbyName: 'dev' }])

  @field({ validate: willThrowAnError })
  employed = true

  @field()
  sause = 'ketchup'

  @field()
  flavor: string[]
}

export default UserFormModel
