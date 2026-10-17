import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "O nome é obrigatório"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "O e-mail é obrigatório"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "A senha é obrigatória"],
      minLength: [8, "A senha deve ter no mínimo 8 caracteres"],
      maxLength: [64, "A senha deve ter no máximo 64 caracteres"],
    },
    role: {
      type: String,
      enum: {
        values: ["Therapist", "Patient"],
      },
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);