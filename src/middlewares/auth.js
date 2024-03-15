import userModel from "../../DB/models/User.model.js"
import jwt from "jsonwebtoken"
import { CustomError } from "../../utils/error.handlling.js"
const auth = (role) => {
  return async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) return next(new CustomError("please login"))

    const token = authorization.split(process.env.BEARER_KEY)[1]
    if (!token) return next(new CustomError("Invalid bearer key"))

    const payload = jwt.verify(token, process.env.TOKEN_SIGNATURE)
    if (!payload?._id) return next(new CustomError("Invalid payload"))

    const user = await userModel.findById({ _id: payload._id })
    if (!user) return next(new CustomError("Not registered account",  404 ))

    if (!role.includes(user.role))
      return next(
        new CustomError("Forbidden, you have no access",401 )
      )

    req.user = user
    next()
  }
}

export default auth
