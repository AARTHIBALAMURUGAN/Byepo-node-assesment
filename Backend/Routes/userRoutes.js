const express=require('express')
const router=express.Router()
const {userSignup,userLogin,checkFeature}=require("../Controller/userController");
const {authMiddleware,requiredRole}=require("../middleware/auth");

router.post("/signup",userSignup);
router.post("/login",userLogin);
router.post("/flags/check",authMiddleware,requiredRole("END_USER"),checkFeature);

module.exports=router;
