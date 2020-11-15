import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy( async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Implement creating a new TODO item
    logger.info('Processing Event ', event)
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const toDoItem = await createTodo(newTodo, jwtToken)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: toDoItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)