import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Types } from 'aws-sdk/clients/s3'
import 'source-map-support/register'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('todosAccess')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
    private readonly s3BucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIndex = process.env.USER_ID_INDEX
  ) {}

  // async todoExists(todoId: string): Promise<boolean> {
  //   const item = await this.getTodo(todoId)
  //   return !!item
  // }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all todos for user ${userId} from ${this.todosTable}`)

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.userIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items

    logger.info(`Found ${items.length} todos for user ${userId} in ${this.todosTable}`)

    return items as TodoItem[]
  }

  async getTodo(todoId: string, userId: string): Promise<TodoItem> {
    logger.info(`Getting todo ${todoId} and user: ${userId} from ${this.todosTable}`)
    
    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }).promise()

    const item = result.Item

    return item as TodoItem
  }

  async createTodo(todoItem: TodoItem) {
    logger.info(`Putting todo ${todoItem.todoId} into ${this.todosTable}`)

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem,
    }).promise()

    return todoItem
  }

  async updateTodo(todoId: string, todoUpdate: TodoUpdate, userId: string) {
    logger.info(`Updating todo item ${todoId}, key: ${userId} in ${this.todosTable}`)


    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression:
        'set #name = :name, #dueDate = :dueDate, #done = :done',      
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      }
    }).promise()
    logger.info(`updated successfully`)
    console.log(userId)
    return todoUpdate
  }

  async deleteTodo(todoId: string, userId: string) {
    logger.info(`Deleting todo item ${todoId} from ${this.todosTable}`)

    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId
      }
    }).promise()

    return userId
  }

  async updateUploadUrl(todoId: string, attachmentUrl: string) {
    logger.info(`Updating attachment URL for todo ${todoId} in ${this.todosTable}`)

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

  async generateUploadUrl (todoId: string): Promise<string> {
    console.log('Generating URL')

    const url = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: 3000
    })
    console.log(url)

    return url as string
  }
}