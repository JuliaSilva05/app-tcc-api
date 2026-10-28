// WIP
import mongoose from "mongoose";

const { Schema } = mongoose;

const recordingSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    audioUrl: { type: String, required: true }, // file in object storage
    durationSec: { type: Number },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const assignmentSchema = new Schema(
  {
    activity: { 
        type: Schema.Types.ObjectId, 
        ref: 'Activity', 
        required: true 
    },
    therapist: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patient: {
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
    recordings: [recordingSchema],
    submittedAt: { type: Date, default: null },
    // review: {
    //   feedback: { type: String, default: '' },
    //   reviewedAt: { type: Date, default: null },
    // },
  },
  { timestamps: true },
);

// // Patient's home screen: "my pending activities"
// assignmentSchema.index({ patient: 1, status: 1 });
// // Therapist's review queue: "submitted by my patients"
// assignmentSchema.index({ therapist: 1, status: 1 });
// Prevent assigning the same activity twice to the same patient
// assignmentSchema.index({ activity: 1, patient: 1 }, { unique: true });

export default mongoose.model("Assignment", assignmentSchema);