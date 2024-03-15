import Router from "express"
import * as jobControllers from "./controllers/job.controller.js"
import auth from "../../middlewares/auth.js"
import roles from "../../../utils/roles.js"
import { validation } from "../../middlewares/validation.js"
import * as jobValidations from "./job.validations.js"
import { fileUpload, fileValidation } from "../../../utils/multer.js"
const router = Router()

router
  .post(
    "/addJob",
    auth(roles.Company_HR),
    validation(jobValidations.addSchema),
    jobControllers.addJob
  )
  .put(
    "/updateJob/:id",
    auth(roles.Company_HR),
    validation(jobValidations.updateJobSchema),
    jobControllers.updateJob
  )
  .delete("/deleteJob/:id", auth(roles.Company_HR), jobControllers.deleteJob)
  .get("/getAllJobs", auth(Object.keys(roles)), jobControllers.getAllJobs)
  .get(
    "/getAllJobsForCompany",
    auth(Object.keys(roles)),
    validation(jobValidations.getAllJobsForCompanySchema),
    jobControllers.getAllJobsForCompany
  )
  .get(
    "/getJobsWithFilters",
    auth(Object.keys(roles)),
    validation(jobValidations.getJobsWithFiltersSchema),
    jobControllers.getJobsWithFilters
  )
  .post(
    "/applyToJob/:id",
    auth(roles.User),
    fileUpload(fileValidation.file).single("userResume"),
    jobControllers.applyToJob
  )
  .get(
    "/applications/:id",
    auth(Object.keys(roles)),
    jobControllers.applicationsOnADay
  )

export default router
