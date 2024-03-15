import mongoose from "mongoose"

const connectToDb = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log("Successfully connected to DB..."))
    .catch((error) => console.error("Error connecting to DB:", error))
}
export default connectToDb
