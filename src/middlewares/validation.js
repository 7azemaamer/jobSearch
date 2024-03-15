import { CustomError } from "../../utils/error.handlling.js"

export const validation = (schema, containHeaders = false) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.param, ...req.query }

    if (req.file) data.file = req.file
    if (req.files) data.files = req.files
    if (req.headers.authorization && containHeaders) {
      data = { authorization: req.headers.authorization }
    }
    const validationResult = schema.validate(data, { abortEarly: false })

    if (validationResult.error) {
      req.validationError = validationResult.error
      return next(
        new CustomError(`Validation Error ${validationResult.error}`, 400)
      )
    }

    next()
  }
}
