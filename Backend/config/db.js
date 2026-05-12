const mongoose=require("mongoose")
require('dotenv').config();
const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connected")
    }
    catch(err){
        console.log("Something went wrong on connecting database" , err)
    }
}

module.exports=connectDB;