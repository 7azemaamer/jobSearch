import joi from "joi"
import { generalFields } from "../../../utils/generalFields.js"

export const signUpSchema = joi
  .object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    username: joi.string().min(2).max(24),
    email: generalFields.email,
    password: generalFields.password,
    recoveryEmail: generalFields.email.allow(null),
    DOB: joi.date().max("now").required(),
    mobileNumber: joi.string().required(),
    role: joi.string().valid("User", "Company_HR").required(),
    status: joi.string().valid("online", "offline"),
    cPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required()
  
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

export const signInSchema = joi
  .object({
    email: generalFields.email,
    password: generalFields.password,
    mobileNumber: joi.string().optional(),
  })
  .required()
