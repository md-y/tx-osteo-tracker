import {
  ValidationError,
  type AnyObject,
  type ObjectSchema,
  mixed,
  type AnySchema,
} from 'yup'
import type { DefaultEvent } from './types'

/**
 * Returns a validated body from an API request.
 * If validation fails, a 400 error is thrown.
 * @param event API request event with body
 * @param schema Yup schema
 * @param formData If true, the body will be parsed as a form data body
 * @returns
 */
export async function validateBody<T extends AnyObject>(
  event: DefaultEvent,
  schema: ObjectSchema<T>,
  formData = false,
): ReturnType<typeof schema.validate> {
  let rawBody: any
  if (formData) {
    const formData = await readFormData(event)
    rawBody = Object.fromEntries(formData.entries())
  } else {
    rawBody = await readBody(event)
  }

  try {
    return await schema.validate(rawBody)
  } catch (error: any) {
    if (error instanceof ValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      })
    }
    throw error
  }
}

/**
 * Returns a mixed Yup type configured for files.
 * @param allowedTypes If defined, only allows files of certain MIME types
 * @param maxFileSize If defined, only allows files up to a certain size in bytes
 * @returns
 */
export function createFileValidator(
  allowedTypes: string[] | null,
  maxFileSize: number | null,
) {
  return mixed(
    (value): value is File =>
      typeof value === 'object' && 'type' in value && 'size' in value,
  )
    .test(
      'fileType',
      (info) => `Invalid file type: ${info.value.type}`,
      (value) =>
        !value || allowedTypes === null || allowedTypes.includes(value.type),
    )
    .test(
      'fileSize',
      (info) => `Invalid file size: ${info.value.size} > ${maxFileSize}`,
      (value) => !value || maxFileSize === null || value.size <= maxFileSize,
    )
}

/**
 * Automatically transforms a string to either an array or object Yup validator
 * @param value The inner array or object validator
 * @returns
 */
export function stringified<T extends AnySchema>(innerType: T) {
  return innerType.transform((value) => {
    try {
      return JSON.parse(value)
    } catch {
      return Symbol('Invalid JSON')
    }
  }) as T
}
