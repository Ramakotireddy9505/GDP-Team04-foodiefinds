const mongoose = require("mongoose")
const bcrypt=require("bcryptjs")

const adminSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique: true,
        required:true,
        trim:true,
        lowercase:true, 
    },
    password:{
        type:String,
        required:false,
        trim:true,
    }
})

//userdef function for hiding private data
adminSchema.methods.toJSON = function(){
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    return userObj
} 


//userdef function for authentication
adminSchema.statics.findByCredentials = async ( email, password ) => {
    const user = await adminModel.findOne({ email })   
    if(!user){
       // throw new Error("Email is incorrect")
       console.log("Admin not found")
       return  "Admin not found"
    }
    const isMatched = await bcrypt.compare( password, user.password )
    if(!isMatched){
       // throw new Error("password is incorrect")
       console.log("password is incorrect")
       return "Password is incorrect"
    }
    return user
}


//userdef function for authentication
adminSchema.statics.findByEmail = async (email) => {
    // console.log("erwe")
    const user = await adminModel.findOne({ email })
   // console.log(user,"user")
    if(!user){
       // throw new Error("unable to find")
        console.log("Unable to find")
        return "Unable to find"
    }
    return user
}

//userdef function for authentication
adminSchema.statics.findUserById = async (id) => {
    console.log("reached schema")
    const user = await adminModel.findById({_id : id})
    // console.log(user,"user")
    if(!user){
        throw new Error("unable to find")
    }
    return user
}


adminSchema.pre("save",async function (next) {
    const user = this
    
   if(user.isModified('password')){
       user.password = await bcrypt.hash(user.password,8)
   }
    next()
})

//creating a company model
const adminModel = mongoose.model('Admins',adminSchema)

module.exports=adminModel