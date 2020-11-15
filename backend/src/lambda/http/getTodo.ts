import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('getTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    logger.info('Processing Event ', event)
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const todoId = event.pathParameters.todoId

    const toDos = await getTodo(todoId, jwtToken)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: toDos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)