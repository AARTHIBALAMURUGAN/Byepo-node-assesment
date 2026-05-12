const FeatureFlag=require("../Models/FeatureFlag")
const User=require("../Models/User");
const mongoose = require("mongoose");
const bcrypt=require('bcrypt');
const { generateToken } = require("../utils/token");

// Admin Auth APIs
const adminSignup=async(req,res)=>{
    try{
        const {name,email,password,organizationId}=req?.body ?? {};
        if(!name || !email || !password || !organizationId){
            return res.status(400).json({message:"All fields are required"});
        }
        const existing=await User.findOne({email: email});
        if(existing){
            return res.status(400).json({message:"User exists"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({
            name,
            email: email,
            password:hashedPassword,
            role:"ORG_ADMIN",
            organization:organizationId,
        });
        res.json({
            token:generateToken(user._id),
               user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization
    }

        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:err.message});
    }
}

const adminLogin=async(req,res)=>{

    try{
        const{email,password}=req?.body ?? {};
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user=await User.findOne({email: email});
        if(!user || user.role!=="ORG_ADMIN"){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        const match=await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(400).json({message:"Invalid credentials"})
        }
        res.json({
            token:generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
            },
        })
    }
    catch(err){
        
        res.status(500).json({message:err.message});
    }


}


// Feature Flag APIs
const createFeature=async(req,res)=>{
    try{
        const { key, enabled } = req?.body ?? {};
        if (!key || typeof key !== "string" || !key.trim()) {
            return res.status(400).json({ message: "Valid feature key is required" });
        }
        if (enabled !== undefined && typeof enabled !== "boolean") {
            return res.status(400).json({ message: "enabled must be a boolean" });
        }
        const feature=await FeatureFlag.create({
           key,
           enabled,
           organization:req?.user?.organization, 
        });
        res.json(feature)
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

const getFeatures=async(req,res)=>{
    try{
        const feature=await FeatureFlag.find({
            organization:req?.user?.organization,
        })
        res.json(feature);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

const updateFeature=async(req,res)=>{
    try{
        const featureId = req?.params?.id;
        if (!mongoose.Types.ObjectId.isValid(featureId)) {
            return res.status(400).json({ message: "Invalid feature id" });
        }
        const updateData={};
        if (req?.body?.key === undefined && req?.body?.enabled === undefined) {
            return res.status(400).json({ message: "At least one field (key or enabled) is required" });
        }
        if(req?.body?.key!==undefined){
            if (typeof req?.body?.key !== "string" || !req?.body?.key?.trim()) {
                return res.status(400).json({ message: "key must be a non-empty string" });
            }
            updateData.key=req?.body?.key;
        }
        if(req?.body?.enabled!==undefined){
            if (typeof req?.body?.enabled !== "boolean") {
                return res.status(400).json({ message: "enabled must be a boolean" });
            }
            updateData.enabled=req?.body?.enabled;
        }

        const feature=await FeatureFlag.findOneAndUpdate(
            {
                _id:featureId,
                organization:req?.user?.organization,
            },
            updateData,
            {new:true}
        );
        if(!feature){
            return res.status(404).json({message:"Feature not found"});
        }
        res.json(feature);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

const deleteFeature=async(req,res)=>{
    try{
        const featureId = req?.params?.id;
        if (!mongoose.Types.ObjectId.isValid(featureId)) {
            return res.status(400).json({ message: "Invalid feature id" });
        }
        const feature=await FeatureFlag.findOneAndDelete({
            _id:featureId,
            organization:req?.user?.organization,
        });
        if(!feature){
            return res.status(404).json({message:"Feature not found"});
        }
        res.json({message:"Deleted"});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}



module.exports={createFeature,getFeatures,updateFeature,deleteFeature,adminSignup,adminLogin}
// #endregion
