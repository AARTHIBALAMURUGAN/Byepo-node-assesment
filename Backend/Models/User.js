const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ORG_ADMIN", "END_USER"],
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: function requiredOrganization() {
        return this.role === "ORG_ADMIN" || this.role === "END_USER";
      },
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("User", userSchema);
