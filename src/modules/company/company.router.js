import Router from "express"
import * as companyControllers from "./controllers/company.controller.js"
import auth from "../../middlewares/auth.js"
import roles from "../../../utils/roles.js"
import { validation } from "../../middlewares/validation.js"
import * as companyValidations from "./company.validation.js"
const router = Router()

router
  .get("/getCompany/:id", auth(roles.Company_HR), companyControllers.getCompany)
  .post(
    "/addCompany",
    auth(roles.Company_HR),
    validation(companyValidations.addCompanySchema),
    companyControllers.addCompany
  )
  .put(
    "/updateCompany/:id",
    auth(roles.Company_HR),
    validation(companyValidations.updateCompanySchema),
    companyControllers.updateCompany
  )
  .delete(
    "/deleteCompany/:id",
    auth(roles.Company_HR),
    companyControllers.deleteCompany
  )
  .get(
    "/searchByName",
    auth(Object.keys(roles)),
    companyControllers.deleteCompany
  )
  .get(
    "/appsForCompany",
    auth(roles.Company_HR),
    companyControllers.getApplicationsForCompanyJobs
  )

export default router
