import mongoose from "mongoose";

function connectDB() {
    console.log(process.env.MONGO_URI),
  mongoose.connect(process.env.MONGO_URI)
  .then(()=>{
        console.log("connnected to Db")
    }).catch((err)=>{
        console.log("error while connecting to db", err)
    })
}
export default connectDB;