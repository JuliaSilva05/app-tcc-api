// WIP
import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    therapist: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    imageUrl: {

    },
    tips: [{
      type: String,
    }]
  },
  { timestamps: true },
)

export default mongoose.model("Question", questionSchema);