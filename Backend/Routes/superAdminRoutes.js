const express =require("express")
const router=express.Router();
const{login,createOrganization,getOrganizations}=require("../Controller/superAdminController")
const{superAdminMiddleware}=require("../middleware/auth")

router.post("/login",login);
router.post("/organizations",superAdminMiddleware,createOrganization);
router.get("/organizations",superAdminMiddleware,getOrganizations)

module.exports=router;
