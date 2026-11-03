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
    titleAudio: { type: audioSchema, default: null },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    imageUrl: { type: String, default: null },
    // imageUrl: {

    // },
    tips: [
      new Schema(
        {
          text: { type: String, required: true },
          audio: { type: audioSchema, default: null },
        },
        { _id: true } // lets you edit/reorder/replace one tip's audio by id
      ),
    ],
    // tips: [{
    //   type: String,
    // }]
  },
  { timestamps: true },
)

export default mongoose.model("Question", questionSchema);