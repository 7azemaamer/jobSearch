import { Router } from "express"
import * as authController from "./controllers/auth.controller.js"
import * as authValidation from "./auth.validation.js"
import { validation } from "../../middlewares/validation.js"

const router = Router()
router
  .post(
    "/signup",
    validation(authValidation.signUpSchema),
    authController.signUp
  )
  .post(
    "/signIn",
    validation(authValidation.signInSchema),
    authController.signIn
  )
  .get("/confirmEmail/:token", authController.confirmEmail)
  .get(
    "/refreshToken/:token",
    validation(authValidation.signInSchema),
    authController.confirmEmail
  )
export default router
