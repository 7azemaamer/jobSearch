import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: path.resolve("./config/.env") })
import express from "express"
import bootstrap from "./src/bootstrap.js"

const app = express()
const PORT = process.env.PORT || 3000


bootstrap(app, express)

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`)
})
