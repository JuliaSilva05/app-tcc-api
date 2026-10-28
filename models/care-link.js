import mongoose from "mongoose";

const { Schema } = mongoose;

const careLinkSchema = new Schema(
  {
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
    therapistDisplayName: {
      type: String,
      trim: true,
    },
    patientDisplayName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "archived", "rejected"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true },
)

careLinkSchema.index({ therapist: 1, patient: 1 }, { unique: true });
// careLinkSchema.index({ patient: 1, status: 1 });
// careLinkSchema.index({ therapist: 1, status: 1 });

export default mongoose.model("CareLink", careLinkSchema);