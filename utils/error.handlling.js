export class CustomError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      return next(new CustomError(error, 500))
    })
  }
}

export const globalError = (error, req, res, next) => {
  if (process.env.MOOD === "DEV") {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message, stack: error.stack })
  } else {
    return res.status(error.statusCode || 500).json({ message: error.message })
  }
}
