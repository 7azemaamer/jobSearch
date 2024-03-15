import bcrypt from "bcrypt"

export const hashPassword = ({ plainText, salt = process.env.SALT_ROUND } = {}) => {
  const hashReslut = bcrypt.hashSync(plainText, parseInt(salt))
  return hashReslut
}

export const comparePassword = ({ plainText, hashValue } = {}) => {
  const match = bcrypt.compareSync(plainText, hashValue)
  return match
}
