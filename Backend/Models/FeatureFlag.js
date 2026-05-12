const mongoose = require("mongoose");
const flagSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, lowercase: true },
    enabled: { type: Boolean, default: false },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true },
);

flagSchema.index({ key: 1, organization: 1 }, { unique: true });
module.exports = mongoose.model("FeatureFlag", flagSchema);
