import joi from "joi"
import { generalFields } from "../../../utils/generalFields.js"

export const addSchema = joi
  .object({
    jobTitle: joi.string().min(2).required(),
    jobLocation: joi.string().valid("onsite", "remotely", "hybrid").required(),
    workingTime: joi.string().valid("part-time", "full-time").required(),
    seniorityLevel: joi
      .string()
      .valid("Junior", "Mid-Level", "Senior", "Team-Lead", "CTO")
      .required(),
    jobDescription: joi.string().required(),
    technicalSkills: joi.array().items(joi.string()).min(1).required(),
    softSkills: joi.array().items(joi.string()).min(1).required(),
    companyId: generalFields.id.required(),
    addedBy: generalFields.id.required(),
  })
  .required()

export const updateJobSchema = joi
  .object({
    jobTitle: joi.string().min(2),
    jobLocation: joi.string().valid("onsite", "remotely", "hybrid"),
    workingTime: joi.string().valid("part-time", "full-time"),
    seniorityLevel: joi
      .string()
      .valid("Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"),
    jobDescription: joi.string(),
    technicalSkills: joi.array().items(joi.string()).min(1),
    softSkills: joi.array().items(joi.string()).min(1),
  })
  .required()

// export const deleteJobSchema = joi.object({
//   id: generalFields.id.required(),
// }).required()

export const getAllJobsForCompanySchema = joi.object({
  companyName: joi.string().required(),
}).required()

export const getJobsWithFiltersSchema = joi.object({
  jobTitle: joi.string().min(2),
  jobLocation: joi.string().valid("onsite", "remotely", "hybrid"),
  workingTime: joi.string().valid("part-time", "full-time"),
  seniorityLevel: joi.string().valid(
    "Junior",
    "Mid-Level",
    "Senior",
    "Team-Lead",
    "CTO"
  ),
  technicalSkills: joi.array().items(joi.string().min(1)),
}).min(1)
