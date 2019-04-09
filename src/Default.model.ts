import { field } from './decorators'

class DefaultModel {
  @field()
  [''] = ''
}

export default DefaultModel
