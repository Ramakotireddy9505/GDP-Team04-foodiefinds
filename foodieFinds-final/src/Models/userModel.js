const mongoose = require("mongoose")
const bcrypt=require("bcryptjs")

const reservationSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    tableSize: {
        type: Number,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: Number,
        required: true,
        trim: true
    },
    customerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    onHold: {
        type: Boolean,
        default: false,
        required: false
    },
    status: {
        type: String,
        default: "Reserved",
        required: false                                
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: false,
        trim: true,
    },
    blocked:{
        type: Boolean,
        default: false
    },
    reservations: [reservationSchema],
    favoriteRestaurants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    }],
    favoriteFoods: [{
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
        foodName: { type: String }
    }]
}); 

//userdef function for hiding private data
userSchema.methods.toJSON = function(){
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    return userObj
} 


//userdef function for authentication
userSchema.statics.findByCredentials = async ( email, password ) => {
    const user = await userModel.findOne({ email })   
    if(!user){
       // throw new Error("Email is incorrect")
       console.log("User not found")
       return  "User not found"
    }
    const isMatched = await bcrypt.compare( password, user.password )
    if(!isMatched){
       // throw new Error("password is incorrect")
       console.log("password is incorrect")
       return isMatched
    }
    return user
}


//userdef function for authentication
userSchema.statics.findByEmail = async (email) => {
    // console.log("erwe")
    const user = await userModel.findOne({ email })
   // console.log(user,"user")
    if(!user){
       // throw new Error("unable to find")
        console.log("Unable to find")
        return "Unable to find"
    }
    return user
}

//userdef function for authentication
userSchema.statics.findUserById = async (id) => {
    console.log("reached schema")
    const user = await userModel.findById({_id : id})
    // console.log(user,"user")
    if(!user){
        throw new Error("unable to find")
    }
    return user
}


userSchema.pre("save",async function (next) {
    const user = this
    
   if(user.isModified('password')){
       user.password = await bcrypt.hash(user.password,8)
   }
    next()
});


// Method to add a restaurant to favorites
userSchema.methods.addFavoriteRestaurant = async function(restaurantId) {
    const user = this;
    if (!user.favoriteRestaurants.includes(restaurantId)) {
        user.favoriteRestaurants.push(restaurantId);
        await user.save();
    }
    return user;
};

// Method to remove a restaurant from favorites
userSchema.methods.removeFavoriteRestaurant = async function(restaurantId) {
    const user = this;
    user.favoriteRestaurants = user.favoriteRestaurants.filter(id => id.toString() !== restaurantId.toString());
    await user.save();
    return user;
};

// Method to add a food item to favorites
userSchema.methods.addFavoriteFood = async function(restaurantId, foodName) {
    const user = this;
    const isAlreadyFavorited = user.favoriteFoods.some(fav => {
       // console.log(fav)
        fav.restaurantId.toString() === restaurantId.toString() && fav.foodName.toString() === foodName.toString()
    }
        
    );
    if (!isAlreadyFavorited) {
        user.favoriteFoods.push({ restaurantId, foodName });
        await user.save();
    }
    return user;
};

// Method to remove a food item from favorites
userSchema.methods.removeFavoriteFood = async function(restaurantId, foodName) {
    const user = this;
    user.favoriteFoods = user.favoriteFoods.filter(fav =>
        !(fav.restaurantId.toString() === restaurantId.toString() && fav.foodName.toString() === foodName.toString())
    );
    await user.save();
    return user;
};


// Check if the model already exists in the cache
const userModel = mongoose.models.Users || mongoose.model('Users', userSchema);

module.exports=userModel