import applicationModel from "../../../../DB/models/Application.js"
import companyModel from "../../../../DB/models/Company.model.js"
import jobModel from "../../../../DB/models/job.model.js"
import cloudinary from "../../../../utils/cloudinary.js"
import { CustomError, asyncHandler } from "../../../../utils/error.handlling.js"

export const addJob = asyncHandler(async (req, res, next) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body

  const { _id } = req.user

  const company = await companyModel.findOne({ companyHR: _id })
  if (!company) {
    return next(new CustomError("Company not found for this user", 404))
  }
  const companyId = company._id

  const job = await jobModel.create({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy: _id,
    companyId,
  })

  res.status(201).json({ message: "Job added successfully", job })
})

export const updateJob = asyncHandler(async (req, res, next) => {
  const jobId = req.params.id
  const { _id } = req.user
  const updateFields = req.body

  let job = await jobModel.findById(jobId)

  if (!job) {
    return next(new CustomError("Job not found", 404))
  }

  if (job.addedBy.toString() !== _id.toString()) {
    return next(new CustomError("Not authorized to update this job", 403))
  }
  const newJob = await jobModel.findByIdAndUpdate(jobId, updateFields, {
    new: true,
  })

  res.status(200).json({ message: "Job updated successfully", newJob })
})

export const deleteJob = asyncHandler(async (req, res, next) => {
  const jobId = req.params.id
  const { _id } = req.user

  const job = await jobModel.findById(jobId)

  if (!job) {
    return next(new CustomError("Job not found", 404))
  }

  if (job.addedBy.toString() !== _id.toString()) {
    return next(new CustomError("Not authorized to delete this job", 403))
  }

  await jobModel.findByIdAndDelete(jobId)

  res.status(200).json({ message: "Job is successfully deleted" })
})

export const getAllJobs = asyncHandler(async (req, res, next) => {
  const jobs = await jobModel.find().populate("companyId")

  if (!jobs || jobs.length === 0) {
    return next(new CustomError("No jobs found", 404))
  }

  res.status(200).json({ jobs })
})

export const getAllJobsForCompany = asyncHandler(async (req, res, next) => {
  const { companyName } = req.query

  const company = await companyModel.findOne({ companyName })

  if (!company) {
    return next(new CustomError("Company not found", 404))
  }

  const jobs = await jobModel.find({ companyId: company._id })

  if (!jobs || jobs.length === 0)
    return next(
      new CustomError(`No jobs found for this company '${companyName}'`, 404)
    )

  res.status(200).json({ jobs })
})

export const getJobsWithFilters = asyncHandler(async (req, res, next) => {
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
  } = req.query // get from query nottt body

  const filteredJobs = {}
  if (workingTime) filteredJobs.workingTime = workingTime
  if (jobLocation) filteredJobs.jobLocation = jobLocation
  if (seniorityLevel) filteredJobs.seniorityLevel = seniorityLevel
  if (jobTitle) filteredJobs.jobTitle = jobTitle
  if (technicalSkills)
    filteredJobs.technicalSkills = { $in: technicalSkills.split(",") }

  const jobs = await jobModel.find(filteredJobs)

  if (!jobs || jobs.length === 0)
    return next(
      new CustomError("No jobs found matching the specified criteria", 404)
    )

  res.status(200).json({ jobs })
})

export const applyToJob = asyncHandler(async (req, res, next) => {
  const { userTechSkills, userSoftSkills } = req.body
  const { _id } = req.user
  const jobId = req.params.id

  const { public_id, secure_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.APP_NAME}/job/${jobId}/resumes` }
  )
  if (!public_id) next(new CustomError("resume is required", 400))

  const userApplication = await applicationModel.create({
    jobId,
    userId: _id,
    userTechSkills,
    userSoftSkills,
    userResume: public_id,
  })
  console.log(userApplication)
  res
    .status(201)
    .json({ message: "Application is successfully submitted", userApplication })
})
