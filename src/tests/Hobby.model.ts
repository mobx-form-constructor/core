import { field } from '../decorators'

import { required } from './utils'

class Hobby {
  @field({ validate: required })
  hobbyId = 1

  @field({ validate: required })
  hobbyName = 'dev'
}

export default Hobby
