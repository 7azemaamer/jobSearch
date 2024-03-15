import * as dotenv from "dotenv"
import path from "path"
import cloudinary from "cloudinary"

dotenv.config({ path: path.resolve("./config/.env") })
export default cloudinary.v2.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
  secure: true,
})
