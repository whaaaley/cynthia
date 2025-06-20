// Generic retry utility

export type RetryOptions<T> = {
  operation: () => Promise<T>
  isSuccess: (result: T) => boolean
  maxRetries: number
  operationName: string
}

export const retryWithCallback = async <T,>(options: RetryOptions<T>): Promise<T> => {
  const { operation, isSuccess, maxRetries, operationName } = options
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      const message = attempt === 0 ? `${operationName}...` : `Retrying ${operationName.toLowerCase()}... (attempt ${attempt + 1}/${maxRetries + 1})`
      console.log(message)

      const result = await operation()

      if (isSuccess(result)) {
        return result
      }
      throw new Error(`${operationName} failed validation`)
    } catch (e) {
      attempt++
      if (attempt > maxRetries) {
        throw new Error(`Failed ${operationName.toLowerCase()} after ${maxRetries + 1} attempts`)
      }

      console.error(`${operationName} attempt ${attempt} failed:`, e)
    }
  }

  throw new Error('Unexpected error in retry logic')
}
