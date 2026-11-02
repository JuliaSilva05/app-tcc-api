import mongoose from "mongoose";

const { Schema } = mongoose;

const activitySchema = new Schema(
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
    questions: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Question' 
    }],
  },
  { timestamps: true },
)

export default mongoose.model("Activity", activitySchema);