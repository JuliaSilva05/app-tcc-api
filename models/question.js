// WIP
import mongoose from "mongoose";
import { audioSchema } from "./audio";

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
    descriptionAudio: { type: audioSchema, default: null },
    imageKey: { type: String, default: null },
    tips: [
      new Schema(
        {
          text: { type: String, required: true },
          audio: { type: audioSchema, default: null },
        },
        { _id: true } // lets you edit/reorder/replace one tip's audio by id
      ),
    ],
  },
  { timestamps: true },
)

export default mongoose.model("Question", questionSchema);