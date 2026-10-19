// WIP
import mongoose from "mongoose";

const { Schema } = mongoose;

const assignmentSchema = new Schema(
  {
    activityId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Activity', 
        required: true 
    },
    therapistId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'done', 'not_done'],
      default: 'pending',
    },

    submittedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export default mongoose.model("Assignment", assignmentSchema);