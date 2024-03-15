import joi from "joi"
import { Types } from "mongoose"

export const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("Invalid object id")
}
export const generalFields = {
  email: joi
    .string()
    .email({
      tlds: { allow: ["com", "co", "net", "ai"] },
    })
    .required(),
  password: joi
    .string()
    .pattern(new RegExp(/^.{8,}$/))
    .required(),
  id: joi.string().custom(validateObjectId).required(),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
}
