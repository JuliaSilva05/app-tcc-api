import mongoose from "mongoose";

const { Schema } = mongoose;

const folderSchema = new Schema(
  {
    therapist: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    kind: { 
        type: String, 
        enum: ['question', 'activity'], 
        required: true 
    },
 
    // Array order = manual order chosen by the therapist
    items: [{ 
        type: Schema.Types.ObjectId, 
        refPath: 'itemModel' 
    }],
    itemModel: {
      type: String,
      enum: ['Question', 'Activity'],
      required: true,
    },
  },
  { timestamps: true }
);

folderSchema.pre('validate', function (next) {
  this.itemModel = this.kind === 'question' ? 'Question' : 'Activity';
  // next();
});

folderSchema.index({ therapist: 1, kind: 1, parent: 1 });
// "Which folders contain this item?"
folderSchema.index({ items: 1 });

export default mongoose.model("Folder", folderSchema);