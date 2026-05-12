const jwt=require('jsonwebtoken')
require('dotenv').config();
const User=require("../Models/User")

async function authMiddleware(req,res,next){
    const token=req.headers.authorization?.split(' ')[1];
    if(!token)
        return res.status(401).json({error:"No token provided"});
    try{
        const decode=jwt.verify(token,process.env.JWT_SECRET) ;

        const user=await User.findById(decode.id);
        if(!user){
            return res.status(401).json({
                error:"User Not Found",
            });
        }
        req.user=user;
        next();
       }
       catch{
        res.status(401).json({error:"Invalid or expired token"})
       }
    }

       function requiredRole(...roles){
        return(req,res,next)=>{
            if(!roles.includes(req.user.role)){
                return res.status(403).json({error:"Forbidden"})
            }
            next();
        }

       }

       function superAdminMiddleware(req,res,next){
        const token=req.headers.authorization?.split(' ')[1];
        if(!token){
            return res.status(401).json({error:"No token provided"});
        }
        try{
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            if(decode.role!=="SUPER_ADMIN"){
                return res.status(403).json({error:"Forbidden"});
            }
            req.user=decode;
            next();
        }
        catch{
            res.status(401).json({error:"Invalid or expired token"});
        }
       }
module.exports={authMiddleware,requiredRole,superAdminMiddleware}
