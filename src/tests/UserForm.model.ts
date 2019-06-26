import { field, fieldArray } from '../decorators'
import FieldArrayType from '../FieldArrayType'

import { minLength, required, trim } from './utils'
import Hobby from './Hobby.model'

class UserFormModel {
  @field({ validate: [required, minLength(3)] })
  login = 'alex'

  @field({ validate: [required, minLength(8)], normalize: [trim()] })
  password = 'password'

  @fieldArray()
  hobbies = new FieldArrayType(Hobby, [{ hobbyId: 1, hobbyName: 'dev' }])

  @fieldArray()
  emails = new FieldArrayType(['olefirenk@gmail.com'])

  @field()
  employed = true

  @field()
  sause = 'ketchup'
}

export default UserFormModel
