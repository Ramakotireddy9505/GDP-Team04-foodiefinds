const adminModel = require('../Models/adminModels.js');
const UserModel = require('../Models/userModel.js');
const Restaurant = require('../Models/RestaurantModel.js');
const cloudinary = require('cloudinary').v2;
const { generateTimeSlots } = require('./timeSlotGenerator.js');

const dotenv=require('dotenv').config();
const emailService = require('../emails.js')
var OTPs={

}

// Cloudinary Configuration
cloudinary.config({ 
    cloud_name: 'dv1kx7wef', 
    api_key: '679525356856359', 
    api_secret: 'yWG7PpLeZZkswCV-nBKmVlBvXUo' 
});
    



const adminLogin = async(req,res) => {
    try{
        if(req.body){
            const { email, password } = req.body;
            const fetchUser = await adminModel.findByCredentials(email,password);
            // console.log(fetchUser.username)
            if(fetchUser.username){
                res.status(200).json({response: "Login success"});
                return
            }

            res.status(301).json({error: fetchUser});
        }
    } catch (error){
        // console.log("Error while admin login : ", error);
        res.status(500).send({error : error});
    }
}


const createAdminAccount = async(req,res) => {
    try{
        if(req.body){
            const user = new adminModel(req.body);
            await user.save();
            // console.log("Admin ",user)
            if(user){
               // console.log("Admin account created");
               res.status(200).send({response: "Account created successfully"});
               return 
            }
            res.status(500).send({error: "Something went wrong"});
            return 
        }
    } catch (error){
        // console.log("Failed to create admin account");
        res.status(500).send({error: "Failed to create admin account"});
    }
}

const requestOTP = async (req,res) => {
    try{
        if(req.body){
                const email = req.body.email
                // console.log(email, req.body)
                let randomdigit = Math.floor(100000 + Math.random() * 900000);
                await emailService.sendOTP(email, randomdigit)
                OTPs[email] = randomdigit;
                setTimeout(() => {
                    delete OTPs[`${email}`];
                }, 180000);
                // console.log(OTPs);
                res.status(200).send({success: `OTP sent - ${email}`})
        }
    } catch(err){
        // console.log("Error while login ", err);
        res.send({error: "Wrong password or email"})
    }
}

const checkOTP = async(req,res) => {
    try{
        const {otp, email} = req.body
        if (OTPs[email] && OTPs[email].toString() === otp.toString()) {
            res.status(200).send({success : "Mail Verified"})
            delete OTPs[email];
          } else {
            res.status(300).send({error: "Wrong otp!"})
          }

    } catch (err) {
        // console.log("Error in while checking OTP : ",err)
        res.status(500).send({error : "Something went wrong in server!"})
    }
}


const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await adminModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, message: "Admin account not found" });
        }

        user.password = password

        await user.save();

        res.status(200).send({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: "Server error", error: error.message });
    }
};

const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        if(restaurants.length > 0)
            res.status(200).json({ message: 'Restaurants retrieved successfully', restaurants : restaurants });
        else
            res.status(201).json({ message: 'Empty restaurants' });

    } catch (err) {
        res.status(500).json({ error: err });
    }
};

const addRestaurant = async (req, res) => {
    try {
        // console.log("Add restro")
        const { restaurantName, contactNumber, address, rating, feedback, openingHours } = req.body;
        const imgUrl = req.file ? req.file.path : ''; 
        
        const newRestaurant = new Restaurant({
            restaurantName,
            contactNumber,
            imageUrl: imgUrl,
            address,
            rating,
            feedback,
            openingHours
        });

        const savedRestaurant = await newRestaurant.save();
        res.status(201).json({ message: 'Restaurant added successfully', restaurant: savedRestaurant });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        const timeSlots = generateTimeSlots(restaurant.openingHours);
        res.status(200).json({ message: 'Restaurant found', restaurant, timeSlots });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching restaurant', details: err.message });
    }
};

const editRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const { restaurantName, contactNumber, address, rating, feedback, openingHours, restaurantType } = req.body;
        const imgUrl = req.file ? req.file.path : undefined;

        const updatedData = {
            restaurantName,
            contactNumber,
            address,
            rating,
            feedback,
            openingHours,
            restaurantType
        };
        console.log(updatedData)
        if (imgUrl) updatedData.imageUrl = imgUrl;

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedRestaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.status(200).json({ message: 'Restaurant updated successfully', restaurant: updatedRestaurant });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params; 

        const deletedRestaurant = await Restaurant.findByIdAndDelete(id);

        if (!deletedRestaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.status(200).json({ message: 'Restaurant deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addFood = async (req, res) => {
    try {
        const { restaurantId, foodName, price, description, category } = req.body;
        const foodImage = req.file ? req.file.path : '';

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const foodItem = {
            foodName,
            price,
            description,
            category,
            imageUrl: foodImage,
        };
        
        restaurant.foods.push(foodItem);
        await restaurant.save();

        res.status(201).json({ message: 'Food item added successfully', food: foodItem });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'An error occurred while adding the food item' });
    }
};

const deleteRestaurantFood = async (req, res) => {
    try {
        const { restaurantId, foodName, price } = req.query;
        // console.log(req.query)
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const foodIndex = restaurant.foods.findIndex(
            food => food.foodName === foodName && food.price === parseFloat(price)
        );
        
        if (foodIndex === -1) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        restaurant.foods.splice(foodIndex, 1);
        await restaurant.save();

        res.status(200).json({ message: 'Food item deleted successfully' });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'An error occurred while deleting the food item' });
    }
};


const getAllReservations = async (req, res) => {
    try {
        const reservations = await UserModel.find().populate({
            path: 'reservations.restaurantId',
            select: 'restaurantName address contactNumber'
        });
        
        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found' });
        }

        res.status(200).json({ message: 'Reservations Fetched', reservations});
    } catch (err) {
         console.error(err);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }

}


    const getAllUsers = async (req, res) => {
        try {
            const users = await UserModel.find();
            
            if (!users || users.length === 0) {
                return res.status(404).json({ message: 'No users found' });
            }
    
            res.status(200).json({ message: 'Users Fetched', users});
        } catch (err) {
            // console.error(err);
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    };

    const blockUser = async (req, res) => {
        try {
            const id = req.query.userId;
            const user = await UserModel.findById(id);
    
            if (user) {
                user.blocked = true;
                await user.save();
                res.status(200).send({ message: "User blocked from future reservations" });
                return;
            }
    
            res.status(400).send({ error: "User not found" });
        } catch (err) {
            // console.error(err);
            res.status(500).json({ error: 'Failed to fetch user, due to ' + err });
        }
    };
    
    const unblockUser = async (req, res) => {
        try {
            const id = req.query.userId;
            const user = await UserModel.findById(id); 
    
            if (user) {
                user.blocked = false;
                await user.save();
                res.status(200).send({ message: "User unblocked successfully" });
                return;
            }
    
            res.status(400).send({ error: "User not found" });
        } catch (err) {
            // console.error(err);
            res.status(500).json({ error: 'Failed to fetch user, due to ' + err });
        }
    };
    



module.exports = {
    adminLogin,
    createAdminAccount,
    requestOTP,
    checkOTP,
    resetPassword,
    addRestaurant,
    editRestaurant,
    deleteRestaurant,
    getRestaurants,
    getRestaurant,
    addFood,
    deleteRestaurantFood,
    getAllReservations,
    getAllUsers,
    blockUser,
    unblockUser
}