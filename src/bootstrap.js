import connectToDb from "../DB/connection.js"
import { globalError } from "../utils/error.handlling.js"
import authRouter from "./modules/auth/auth.router.js"
import userRouter from "./modules/user/user.router.js"
import companyRouter from "./modules/company/company.router.js"
import jobRouter from "./modules/job/job.router.js"

const bootstrap = (app, express) => {
  app.use(express.json({}))

  app.use(`/auth`, authRouter)
  app.use(`/user`, userRouter)
  app.use(`/company`, companyRouter)
  app.use(`/job`, jobRouter)
  // app.use(`/application`, applicationRouter)

  app.all(`*`, (req, res, next) => {
    res.send({ message: "Invalid routing, please check the URL or the method" })
  })
  app.use(globalError)
  connectToDb()
}
export default bootstrap
