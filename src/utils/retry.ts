export type RetryOptions<T> = {
  operation: () => Promise<T>
  isSuccess: (result: T) => boolean
  maxRetries: number
  operationName: string
}

export const retryWithCallback = async <T,>(options: RetryOptions<T>) => {
  const { operation, isSuccess, maxRetries, operationName } = options
  console.log(`${operationName}...`)

  let attempt = 0
  while (attempt <= maxRetries) {
    try {
      console.log(`Retrying ${operationName.toLowerCase()}... (attempt ${attempt}/${maxRetries + 1})`)

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
}
