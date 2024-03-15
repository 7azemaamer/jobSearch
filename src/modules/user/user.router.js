import { Router } from "express"
import * as userController from "./controllers/user.controller.js"
import * as userValidation from "./user.validation.js"
import { validation } from "../../middlewares/validation.js"
import auth from "../../middlewares/auth.js"
import roles from "../../../utils/roles.js"

const router = Router()

router
  .get("/profile/:id", userController.getProfileData)
  .get("/account/:id", auth(Object.keys(roles)), userController.getAccountData)
  .put(
    "/updateAccount/:id",
    validation(userValidation.updateAccountSchema),
    userController.updateAccount
  )
  .patch(
    "/sendOTP",
    validation(userValidation.sendOTPSchema),
    userController.sendOTP
  )
  .put(
    "/forgetPassword",
    validation(userValidation.forgetPasswordSchema),
    userController.forgetPassword
  )

export default router
