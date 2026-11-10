import mongoose from "mongoose";

const { Schema } = mongoose;

export const audioSchema = new Schema(
  {
    key: { type: String, required: true }, // path in the bucket, e.g. "audio/questions/abc123.m4a"
    mimeType: { type: String, default: 'audio/mp4' },
    durationSec: { type: Number },
    sizeBytes: { type: Number },
  },
  { _id: false }
);