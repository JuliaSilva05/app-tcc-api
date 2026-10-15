import mongoose from "mongoose";

const { Schema } = mongoose;

const patientSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
      max: 64,
    },
  }
)

export default mongoose.model("Patient", patientSchema);