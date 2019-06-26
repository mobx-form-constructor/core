import { field } from '../decorators'

class Hobby {
  @field()
  hobbyId = 1

  @field()
  hobbyName = 'dev'
}

export default Hobby
