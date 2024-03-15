import joi from "joi"
import { generalFields } from "../../../utils/generalFields.js"

export const addCompanySchema = joi
  .object({
    companyName: joi.string().min(2).required(),
    description: joi.string().min(3).required(),
    industry: joi.string().required(),
    address: joi.string().required(),
    numberOfEmployees: joi
      .string()
      .pattern(new RegExp(/^\d+-\d+$/))
      .required(),
    companyEmail: generalFields.email.required(),
    companyHR: generalFields.id.required(),
  })
  .required()

export const updateCompanySchema = joi
  .object({
    companyName: joi.string().min(2),
    description: joi.string().min(3),
    industry: joi.string(),
    address: joi.string(),
    numberOfEmployees: joi.number(),
    companyEmail: generalFields.email,
    companyHR: generalFields.id.required(),
  })
  .required()
