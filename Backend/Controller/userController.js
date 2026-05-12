const FeatureFlag = require("../Models/FeatureFlag");
const User = require("../Models/User");
const Organization = require("../Models/organization");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");

//  End User signup login APIs
const userSignup = async (req, res) => {
  try {
    const { name, email, password, organizationId } = req?.body ?? {};

    if (!name || !email || !password || !organizationId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User exists" });
    }
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: "Invalid organizationId" });
    }
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(400).json({ message: "Invalid organizationId" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "END_USER",
      organization: organizationId,
    });

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req?.body ?? {};
    const user = await User.findOne({ email });

    if (!user || user.role !== "END_USER") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//  End User Feature APIs
const checkFeature = async (req, res) => {
  try {
    const { featureKey } = req?.body;
    if (!featureKey) {
      return res.status(400).json({ message: "featureKey is required" });
    }

    const feature = await FeatureFlag.findOne({
      organization: req?.user?.organization,
      key: featureKey,
    });
    if (!feature) {
      return res
        .status(404)
        .json({ message: "Feature not found for this organization" });
    }

    res.json({
      featureKey,
      enabled: feature.enabled,
      organizationId: req?.user?.organization,
    });
  } catch (err) {
    
    res.status(500).json({ message: err.message });
  }
};


module.exports = { userSignup, userLogin, checkFeature };
