import applicationModel from "../../../../DB/models/Application.js"
import companyModel from "../../../../DB/models/Company.model.js"
import jobModel from "../../../../DB/models/job.model.js"
import { CustomError, asyncHandler } from "../../../../utils/error.handlling.js"

export const addCompany = asyncHandler(async (req, res, next) => {
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    companyHR,
  } = req.body

  const company = await companyModel.create({
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    companyHR,
  })
  res.status(201).json({ message: "Company has successfully added", company })
})

export const updateCompany = asyncHandler(async (req, res, next) => {
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    companyHR,
  } = req.body

  const companyID = req.params.id
  if (req.user._id != companyHR) {
    return next(
      new CustomError(
        "Not authorized to do this action, only the HR who added the company can do it"
      ),
      401
    )
  }

  const updatedFields = {}
  if (companyName) updatedFields.companyName = companyName
  if (description) updatedFields.description = description
  if (industry) updatedFields.industry = industry
  if (address) updatedFields.address = address
  if (numberOfEmployees) updatedFields.numberOfEmployees = numberOfEmployees
  if (companyEmail) updatedFields.companyEmail = companyEmail

  const updatedCompany = await companyModel.findByIdAndUpdate(
    companyID,
    updatedFields,
    { new: true }
  )

  if (!updatedCompany) {
    return next(new CustomError("Company not found"), 404)
  }

  res
    .status(200)
    .json({ message: "Company data updated successfully", updatedCompany })
})

export const deleteCompany = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const companyHR = req.user._id

  const company = await companyModel.findById(id)
  if (!company) {
    return next(new CustomError("Company not found"), 404)
  }

  if (company.companyHR.toString() !== companyHR.toString()) {
    return next(new CustomError("Not authorized to delete this company"), 401)
  }

  await companyModel.findByIdAndDelete(id)

  res.status(200).json({ message: "Company deleted successfully" })
})

export const getCompany = asyncHandler(async (req, res, next) => {
  const id = req.params

  const company = await companyModel.findById(id)
  if (!company) {
    return next(new CustomError("Company not found", 404))
  }

  const jobs = await jobModel.find({
    addedBy: company.companyHR,
    companyId: company._id,
  })

  res.status(200).json({ company, jobs })
})

export const searchByName = asyncHandler(async (req, res, next) => {
  const { companyName } = req.body

  const company = await companyModel.findOne({
    companyName: { $regex: new RegExp(companyName, "i") },
  })

  if (!company) next(new CustomError("Found nothing", 404))

  res.status(200).json({ company })
})

export const getApplicationsForCompanyJobs = asyncHandler(async (req, res) => {
  const jobs = await jobModel.find({ addedBy: req.user._id })

  let allApplications = []

  for (const job of jobs) {
    const applications = await applicationModel
      .find({ jobId: job._id })
      .populate("userId", "-_id firstName lastName email")
    allApplications = allApplications.concat(applications)
  }

  res.status(200).json({ applications: allApplications })
})
