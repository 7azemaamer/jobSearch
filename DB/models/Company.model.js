import mongoose from "mongoose"

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  numberOfEmployees: {
    type: String,
    match: /^\d+-\d+$/,
    required: true,
    validate: {
      validator: (value) => /^\d+-\d+$/.test(value),
      message:
        "Number of employees must be in the format '10-20' '100-200', '5600-9000', etc.",
    },
  },
  companyEmail: {
    type: String,
    unique: true,
    required: true,
  },
  companyHR: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

const companyModel = mongoose.model("Company", companySchema)

export default companyModel
