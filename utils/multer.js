import multer from "multer"
import fs from "fs"
import { nanoid } from "nanoid"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  file: ["application/pdf", "application/msword"],
  video: ["video/mp4"],
}

export function fileUpload(customPath = "general", customValidation = []) {
  const fullPath = path.join(__dirname, `../uploads/${customPath}`)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath)
    },
    filename: (req, file, cb) => {
      const uniqueFileName = nanoid() + "_" + file.originalname
      cb(null, uniqueFileName)
    },
  })

  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb("Invalid file format", false)
    }
  }
  const upload = multer({ fileFilter, storage })
  return upload
}
