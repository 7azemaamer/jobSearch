import userModel from "../../../../DB/models/User.model.js"
import sendEmail from "../../../../utils/email.js"
import { CustomError, asyncHandler } from "../../../../utils/error.handlling.js"
import {
  generateToken,
  verifyToken,
} from "../../../../utils/generateVerifyToken.js"
import { comparePassword, hashPassword } from "../../../../utils/hashCompare.js"

export const signUp = asyncHandler(async (req, res, next) => {
  //Check if this email exist in our database
  const { email } = req.body
  const emailExist = await userModel.findOne({ email })
  if (emailExist)
    return next(new CustomError("Email already exist",  409))
  //Send confirmation mail
  const token = generateToken({
    payload: { email },
    signature: process.env.EMAIL_SIGNATURE,
    expiresIn: 30 * 60,
  })
  const refreshToken = generateToken({
    payload: { email },
    signature: process.env.EMAIL_SIGNATURE,
    expiresIn: 60 * 60 * 24,
  })

  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`
  const refreshLink = `${req.protocol}://${req.headers.host}/auth/refreshToken/${refreshToken}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333333; text-align: center;">Email Confirmation</h1>
        <p style="color: #555555; line-height: 1.6;">Thank you for signing up! Please confirm your email address by clicking the button below:</p>
        <p style="text-align: center;">
            <a href="${link}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email</a>
        </p>
        <p style="color: #555555; line-height: 1.6; text-align: center;">If you did not request this confirmation, you can safely ignore this email.</p>
        <p style="color: #555555; line-height: 1.6; text-align: center;">If you need to refresh your token, click <a href="${refreshLink}" style="color: #007bff; text-decoration: none;">here</a>.</p>
    </div>
    `

  if (!sendEmail({ to: email, subject: "Email Confirmation", html }))
    return next(new CustomError("Failed to send email" ,400 ))

  //hashing password
  req.body.password = hashPassword({
    plainText: req.body.password,
    salt: process.env.SALT_ROUND,
  })

  // get username from first and last name and convert it to camel case :)
  const firstName =
    req.body.firstName.charAt(0).toLowerCase() + req.body.firstName.slice(1)
  const lastName =
    req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1)

  const username = firstName + lastName
  req.body.username = username

  const user = await userModel.create(req.body)
  res.status(201).json({ message: "User has been added", _id: user._id })
})

export const signIn = asyncHandler(async (req, res, next) => {
  const { email, mobileNumber, password } = req.body

  //check if the user exists in the database
  const user = await userModel.findOne({
    $or: [{ email }, { mobileNumber }],
  })
  if (!user)
    return next(
      new CustomError("Invalid email, mobile number, or password",401)
    )

  //confirmed? or not
  if (!user.confirmEmail)
    return next(new CustomError("Please Confirm Email",  401 ))

  //compare the provided password with the hashed password in the database
  const isPasswordValid = comparePassword({
    plainText: password,
    hashValue: user.password,
  })
  if (!isPasswordValid) {
    return next(
      new CustomError("Wrong password", 401)
    )
  }
  if (user.isDeleted) {
    user.isDeleted = false
  }
  user.status = "online"
  await user.save()
  const accessToken = generateToken({
    payload: { _id: user._id, email, role: user.role },
    signature: process.env.TOKEN_SIGNATURE,
    expiresIn: 30 * 60,
  })
  const refreshToken = generateToken({
    payload: { _id: user._id, email, role: user.role },
    signature: process.env.TOKEN_SIGNATURE,
    expiresIn: 60 * 60 * 24 * 30,
  })

  res.status(200).json({ accessToken, refreshToken })
})

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params
  const { email } = verifyToken({
    token,
    signature: process.env.EMAIL_SIGNATURE,
  })
  const user = await userModel.findOne({ email })

  if (!user)
    return res.redirect(`${req.protocol}://${req.headers.host}/auth/signUp`)

  if (user.confirmEmail)
    return res.redirect(`${req.protocol}://${req.headers.host}/auth/signIn`)

  await userModel.updateOne({ email }, { confirmEmail: true })
  return res.redirect(`${req.protocol}://${req.headers.host}/auth/signIn`)
})

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { token } = req.params
  const { email } = verifyToken({
    token,
    signature: process.env.EMAIL_SIGNATURE,
  })

  const user = await userModel.findOne({ email })

  if (!user)
    return res.redirect(`${req.protocol}://${req.headers.host}/auth/signUp`)

  if (user.confirmEmail)
    return res.redirect(`${req.protocol}://${req.headers.host}/auth/signIn`)

  const newToken = generateToken({
    payload: { email },
    signature: process.env.EMAIL_SIGNATURE,
    expiresIn: 10 * 60,
  })
  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333333; text-align: center;">Email Confirmation</h1>
        <p style="color: #555555; line-height: 1.6;">Thank you for signing up! Please confirm your email address by clicking the button below:</p>
        <p style="text-align: center;">
            <a href="${link}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email</a>
        </p>
        <p style="color: #555555; line-height: 1.6; text-align: center;">If you did not request this confirmation, you can safely ignore this email.</p>
    </div>
    `

  if (!sendEmail({ to: email, subject: "Email Confirmation", html }))
    return next(new CustomError("Failed to send email", 400 ))

  return res.send("check your email")
})
