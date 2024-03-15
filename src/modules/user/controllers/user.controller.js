import userModel from "../../../../DB/models/User.model.js"
import sendEmail from "../../../../utils/email.js"
import { CustomError, asyncHandler } from "../../../../utils/error.handlling.js"
import { comparePassword, hashPassword } from "../../../../utils/hashCompare.js"
import { customAlphabet } from "nanoid"

export const updateAccount = asyncHandler(async (req, res, next) => {
  const { _id } = req.user

  const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } =
    req.body

  if (_id !== req.params.id) {
    return next(
      new CustomError("You are not authorized to update this account", 403)
    )
  }

  const updatedUserData = {}
  if (email) updatedUserData.email = email
  if (mobileNumber) updatedUserData.mobileNumber = mobileNumber
  if (recoveryEmail) updatedUserData.recoveryEmail = recoveryEmail
  if (DOB) updatedUserData.DOB = DOB
  if (lastName) updatedUserData.lastName = lastName
  if (firstName) updatedUserData.firstName = firstName

  if (updatedUserData.firstName || updatedUserData.lastName) {
    const newFirstName = updatedUserData.firstName || req.user.firstName
    const newLastName = updatedUserData.lastName || req.user.lastName

    const newUsername = newFirstName.toLowerCase() + newLastName.toUpperCase()
    const existedUsername = await userModel.findOne({
      username: newUsername,
    })

    //check if the new username is unique cuz(u told that username is derived in model from first or last ==> not logical but okkkkkkkkkkkkkk)
    if (existedUsername && existedUsername._id !== _id) {
      return next(
        new CustomError(
          "Please change either first name or last name to make the username unique",
          400
        )
      )
    }

    updatedUserData.username = newUsername
  }

  const updatedUser = await userModel.findByIdAndUpdate(_id, updatedUserData, {
    new: true,
  })

  res
    .status(200)
    .json({ message: "Account updated successfully", user: updatedUser })
})

export const deleteAccount = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new CustomError("Unauthorized, please sign in first"), 401)
  }

  const loggedInUserId = req.user._id

  let _id

  if (req.params.id) {
    _id = req.params.id
  } else if (req.query.id) {
    _id = req.query.id
  } else {
    return next(new CustomError("user id is required", 400))
  }

  if (loggedInUserId !== _id) {
    return next(
      new CustomError(
        "Forbidden, only the account user can delete his account",
        403
      )
    )
  }
  const user = await userModel.findOne({ _id })
  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }
  user.isDeleted = true
  user.status = "offline"
})

export const updatePassword = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new CustomError("Unauthorized, please sign in first", 401))
  }

  const { _id } = req.user

  const { currentPassword, newPassword } = req.body

  const user = await userModel.findById(_id)

  if (!user) {
    return next(new CustomError("User not found", 404))
  }

  const isPasswordValid = comparePassword({
    plainText: currentPassword,
    hashValue: user.password,
  })

  if (!isPasswordValid) {
    return next(new CustomError("Current password is incorrect", 401))
  }

  const hashedPassword = hashPassword({
    plainText: newPassword,
    salt: process.env.SALT_ROUND,
  })

  user.password = hashedPassword
  await user.save()

  res.status(200).json({ message: "Password updated successfully" })
})

export const sendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body

  const user = await userModel.findOne({ email })
  if (!user) next(new CustomError("Invalid email", 404))

  if (!user.confirmEmail) next(new CustomError("Email is not confirmed", 404))

  const OTP = customAlphabet("123456789", 6)
  const code = OTP()
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333333; text-align: center;">Forgot Password</h1>
        <p style="color: #555555; line-height: 1.6; text-align: center;">We received a request to reset your password. Please use the following verification code to reset your password:</p>
        <h2 style="color: #333333; text-align: center;">${code}</h2>
        <p style="color: #555555; line-height: 1.6; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
    `
  if (!sendEmail({ to: email, subject: "Forget password OTP", html }))
    return next(new CustomError("Failed to send email", 400))

  await userModel.updateOne({ email }, { code })
  return res.status(200).json({ message: "Check your email" })
})

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email, code, password } = req.body

  const user = await userModel.findOne({ email })
  if (!user) next(new CustomError("Invalid email", 404))
  if (code != user.code || code == null)
    next(new CustomError("Invalid code", 400))

  req.body.password = hashPassword({
    plainText: password,
    salt: process.env.SALT_ROUND,
  })

  const updatedUser = await userModel.findOneAndUpdate(
    { email },
    { password, code: null }
  )
  return res
    .status(200)
    .json({ message: "password reset is done", updatedUser })
})

export const getAccountsByRecoveryEmail = asyncHandler(
  async (req, res, next) => {
    const { recoveryEmail } = req.body

    if (!recoveryEmail) {
      return next(new CustomError("Recovery email is required", 400))
    }

    const users = await userModel.find({ recoveryEmail })

    if (users.length === 0) {
      return next(
        new CustomError(
          "No accounts found with the provided recovery email",
          404
        )
      )
    }

    return res.status(200).json({ users })
  }
)

export const getProfileData = asyncHandler(async (req, res, next) => {
  let { id } = req.params
  if (!id) return next(new CustomError("user id is required", 400))
  const user = await userModel.findOne({ _id: id })
  if (!user) return next(new CustomError("User not found", 404))
  const { _id, firstName, lastName, username, email, DOB, mobileNumber, role } =
    user
  return res.status(200).json({
    user: {
      _id,
      firstName,
      lastName,
      username,
      email,
      DOB,
      mobileNumber,
      role,
    },
  })
})

export const getAccountData = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next("Unauthorized, please sign in first", 401)
  }

  const loggedInUserId = req.user._id

  let _id = req.params.id

  if (!_id) {
    return next(new CustomError("user id is required", 400))
  }
  if (loggedInUserId != _id) {
    return next(
      new CustomError("Forbidden, only the account user can get his data", 403)
    )
  }

  const user = await userModel.findOne({ _id })
  if (!user) {
    return next(new CustomError("User not found", 404))
  }
  return res.status(200).json({ user })
})
