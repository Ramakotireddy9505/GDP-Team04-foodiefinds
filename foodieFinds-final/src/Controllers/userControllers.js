const UserModel = require('../Models/userModel.js');
const Restaurant = require('../Models/RestaurantModel.js');
const adminModel = require('../Models/adminModels.js');
const dotenv=require('dotenv').config();
const emailService = require('../emails.js');
const bcrypt = require('bcryptjs');
const { generateTimeSlots } = require('./timeSlotGenerator.js');
var OTPs={

}

const userLogin = async(req,res) => {
    try{
        if(req.body){
            const { email, password } = req.body;
            const fetchUser = await UserModel.findByCredentials(email,password);
           // // console.log(fetchUser.username)
            if(fetchUser){
                res.status(200).json({response: "Login success", username: fetchUser.username, userId: fetchUser._id});
                return
            } else {
                res.status(401).json({error: "Incorrect credentials"});
            }
        }
    } catch (error){
        // console.log("Error while user login : ", error);
        res.status(500).send({error : error});
    }
}


const createUserAccount = async(req,res) => {
    try{
        if(req.body){
            const user = new UserModel(req.body);
            await user.save();
            // console.log("user ",user)
            if(user){
               // console.log("User account created");
               res.status(200).send({response: "Account created successfully"});
               return 
            }
            res.status(500).send({error: "Something went wrong"});
            return 
        } else {
            res.status(500).send({error: "Something went wrong"});
        }
    } catch (error){
        // console.log("Failed to create user account");
        res.status(500).send({error: "Failed to create user account"});
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findById(userId).select('-password');
        if (user.length == 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, email, password } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username;
        user.email = email;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
         console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


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
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        user.password = password

        await user.save();

        res.status(200).send({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: "Server error", error: error.message });
    }
};


const getRestaurant = async (req, res) => {
    try {
        const { id } = req.params; // Get restaurant ID from request params
        const restaurantId = id;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const users = await UserModel.find({ "reservations.restaurantId": restaurantId });

        const reservations = users.flatMap(user => 
            user.reservations.filter(reservation => reservation.restaurantId.toString() === restaurantId)
        );

        const timeSlots = generateTimeSlots(restaurant.openingHours);
        res.status(200).json({ message: 'Restaurant found', restaurant, timeSlots, reservations });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching restaurant', details: err.message });
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

const createReservation = async (req, res) => {
    try {
        const { userId } = req.params;
        const { restaurantId, date, timeSlot, tableSize, customerName, customerPhone, customerEmail } = req.body;

        const reservation = {
            restaurantId,
            date,
            timeSlot,
            tableSize,
            customerName,
            customerPhone,
            customerEmail,
            isHold : false,
            status: "Reserved"
        };

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $push: { reservations: reservation } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Email trigger 
        res.status(201).json({ message: 'Reservation created successfully', reservation });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
};

const deleteReservation = async (req, res) => {
    try {
        const { userId, reservationId } = req.query;

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { reservations: { _id: reservationId } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User or Reservation not found' });
        }

        res.status(200).json({ message: 'Reservation deleted successfully', reservations: user.reservations });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'Failed to delete reservation' });
    }
};

const blockReservation = async (req, res) => {
    try {
        const { userId, reservationId } = req.params;

        const user = await UserModel.findOneAndUpdate(
            { _id: userId, "reservations._id": reservationId },
            { $set: { "reservations.$.onHold": true, "reservations.$.status": "Blocked" } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User or Reservation not found' });
        }

        res.status(200).json({ message: 'Reservation blocked successfully', reservations: user.reservations });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'Failed to block reservation' });
    }
};

const getAllReservationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId).populate({
            path: 'reservations.restaurantId',
            select: 'restaurantName address contactNumber'
        });
        

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({message: 'Reservations Fetched', reservations: user.reservations });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
};

const getReservationByUserAndId = async (req, res) => {
    try {
        const { userId, reservationId } = req.params;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const reservation = user.reservations.id(reservationId);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        res.status(200).json({message: 'Reservations Fetched', reservation });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'Failed to fetch reservation' });
    }
};

const getReservationById = async (req, res) => {
    try {
        const { reservationId } = req.params;

        const user = await UserModel.findOne({ "reservations._id": reservationId });

        if (!user) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const reservation = user.reservations.id(reservationId);

        res.status(200).json({message: 'Reservations Fetched', reservation });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'Failed to fetch reservation' });
    }
};

const getReservationsByDate = async (req, res) => {
    try {
        const { reservationDate } = req.query;

        const reservations = await Reservation.find({
            reservationDate: new Date(reservationDate),
        });

        res.status(200).json({message: 'Reservations Fetched', reservations });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reservations', details: error.message });
    }
};

const getReservationsByRestaurantId = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const users = await UserModel.find({ "reservations.restaurantId": restaurantId });

        const reservations = users.flatMap(user => 
            user.reservations.filter(reservation => reservation.restaurantId.toString() === restaurantId)
        );

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found for this restaurant' });
        }

        res.status(200).json({ message: "Reservations found for this restaurant", reservations });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
};


const addReview = async (req, res) => {
    const { restaurantId } = req.params;
    const { user, rating, comment } = req.body;
  
    try {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      const newReview = { user, rating, comment };
      restaurant.reviews.push(newReview);
      await restaurant.save();
  
      res.status(201).json({ message: "Review added successfully", review: newReview });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};


const deleteReview = async (req, res) => {
    const { restaurantId, reviewId } = req.params;
  
    try {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      const review = restaurant.reviews.id(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
  
      review.remove();
      await restaurant.save();
      res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  
  

module.exports = {
    userLogin,
    createUserAccount,
    requestOTP,
    checkOTP,
    resetPassword,
    getRestaurant,
    getRestaurants,
    createReservation,
    deleteReservation,
    blockReservation,
    getAllReservationsByUserId,
    getReservationByUserAndId,
    getReservationById,
    getReservationsByDate,
    getReservationsByRestaurantId,
    updateUserProfile,
    getUserProfile,
    deleteUserAccount,
    addReview,
    deleteReview
}

/*

const userLogin = async(req,res) => {
    try{

    } catch (error){
        // console.log("")
    }
}

*/