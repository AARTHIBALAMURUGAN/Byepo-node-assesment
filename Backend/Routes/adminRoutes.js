const express=require("express")
const router=express.Router();
const {createFeature,getFeatures,updateFeature,deleteFeature,adminSignup,adminLogin}=require("../Controller/adminController");
const{authMiddleware,requiredRole}=require("../middleware/auth")
router.post("/signup",adminSignup);
router.post("/login",adminLogin)
router.post("/flags",authMiddleware,requiredRole("ORG_ADMIN"),createFeature);
router.get("/flags",authMiddleware,requiredRole("ORG_ADMIN"),getFeatures);
router.put("/flags/:id",authMiddleware,requiredRole("ORG_ADMIN"),updateFeature);
router.delete("/flags/:id",authMiddleware,requiredRole("ORG_ADMIN"),deleteFeature);


module.exports=router;
