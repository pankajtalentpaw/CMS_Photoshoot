import mongoose, { Schema, Document } from "mongoose";

export type GenerationStatus = "pending" | "processing" | "completed" | "failed";
export type GenerationMode = "Virtual Try-On" | "AI Studio" | "VIDEO_GENERATION";

export interface IGeneration extends Document {
  userId: string;

  // Source assets
  inputImage: string;
  modelId: string;

  // Generation context (for gallery display and downstream pipeline)
  hub?: string;           // Apparel | Jewellery | Accessories | Products
  mode?: GenerationMode;
  segment?: string;       // Ladies | Gents | Kids
  wearType?: string;
  productType?: string;
  jewelleryGenre?: string;
  jewelleryStyle?: string;
  accessoryType?: string;
  productFamily?: string;
  videoStyle?: string;
  outputViews?: string[];

  // Studio config
  background: string;
  outputStyle: string;
  prompt: string;

  // Lifecycle
  status: GenerationStatus;
  creditsCost: number;
  approved: boolean;
  approvedAt?: Date;

  // Video: link back to the image job this video was derived from
  sourceJobId?: string;

  // RunComfy tracking
  requestId?: string;

  // Outputs
  outputImage?: string;
  outputImages?: string[];

  error?: string;
  createdAt: Date;
}

const GenerationSchema: Schema = new Schema({
  userId:         { type: String, required: true, index: true },
  inputImage:     { type: String, required: true },
  modelId:        { type: String, required: true },

  hub:            { type: String },
  mode:           { type: String, enum: ["Virtual Try-On", "AI Studio", "VIDEO_GENERATION"] },
  segment:        { type: String },
  wearType:       { type: String },
  productType:    { type: String },
  jewelleryGenre: { type: String },
  jewelleryStyle: { type: String },
  accessoryType:  { type: String },
  productFamily:  { type: String },
  videoStyle:     { type: String },
  outputViews:    [{ type: String }],

  background:     { type: String, required: true },
  outputStyle:    { type: String, required: true },
  prompt:         { type: String, default: "" },

  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
    index: true,
  },
  creditsCost:  { type: Number, default: 10 },
  approved:     { type: Boolean, default: false },
  approvedAt:   { type: Date },

  sourceJobId:  { type: String },
  requestId:    { type: String },

  outputImage:  { type: String },
  outputImages: [{ type: String }],

  error:        { type: String },
  createdAt:    { type: Date, default: Date.now, index: true },
});

export default mongoose.models.Generation ||
  mongoose.model<IGeneration>("Generation", GenerationSchema);
