import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { parseUserId } from '../auth/utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import * as uuid from 'uuid'
import 'source-map-support/register'

const toDoAccess = new TodoAccess()

const s3BucketName = process.env.ATTACHMENTS_S3_BUCKET

export async function getAllTodos (jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return toDoAccess.getAllTodos(userId)
}

export async function getTodo (todoId: string, jwtToken: string): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  return toDoAccess.getTodo(todoId, userId)
}

export function createTodo (createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  const id = uuid.v4()
  return toDoAccess.createTodo({
    userId: userId,
    todoId: id,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${id}`,
    ...createTodoRequest
  })
}

export function updateTodo ( todoId: string, updateTodoRequest: UpdateTodoRequest, jwtToken: string): Promise<TodoUpdate> {
  const userId = parseUserId(jwtToken)
  return toDoAccess.updateTodo(todoId, updateTodoRequest, userId)
}

export function deleteTodo (todoId: string, jwtToken: string): Promise<string> {
  const userId = parseUserId(jwtToken)
  return toDoAccess.deleteTodo(todoId, userId)
}

export function generateUploadUrl (todoId: string): Promise<string> {
  return toDoAccess.generateUploadUrl(todoId)
}