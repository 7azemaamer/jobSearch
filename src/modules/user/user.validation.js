import joi from "joi"
import { generalFields } from "../../../utils/generalFields.js"

export const updateAccountSchema = joi
  .object({
    firstName: joi.string(),
    lastName: joi.string(),
    username: joi.string().min(2).max(24),
    email: generalFields.email,
    password: generalFields.password,
    recoveryEmail: generalFields.email.allow(null),
    DOB: joi.date().max("now"),
    mobileNumber: joi.string(),
  })
  .required()

export const sendOTPSchema = joi
  .object({
    email: generalFields.email,
  })
  .required()
export const forgetPasswordSchema = joi
  .object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    cPassword: joi.string().valid(joi.ref("password")).required(),
    code: joi.string().pattern(new RegExp(/^\d{6}$/)).required(),
  })
  .required()
