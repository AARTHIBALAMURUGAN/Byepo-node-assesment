const Organization = require("../Models/organization");
const jwt = require("jsonwebtoken");

// superadminlogin
const login = async (req, res) => {
  try {
    const { email, password } = req?.body ;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    
    const superAdminEmail = String(process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
     const inputEmail = String(email).trim().toLowerCase();
    if (
      inputEmail === superAdminEmail &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ role: "SUPER_ADMIN" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.json({ token });
    }
    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//add organization
const createOrganization = async (req, res) => {
  try {
    const orgName = req?.body?.name;
    const organization = await Organization.create({
      name: orgName,
    });
    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//retrive organization
const getOrganizations = async (req, res) => {
  try {
    const organization = await Organization.find();
    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { login, createOrganization, getOrganizations };
