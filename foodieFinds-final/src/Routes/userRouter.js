const express = require('express')
const Router = express.Router()
const userControllers = require('../Controllers/userControllers.js')
const UserModel = require('../Models/userModel.js');
const Restaurant = require('../Models/RestaurantModel.js');

Router.get('/getRestaurants', userControllers.getRestaurants);
Router.get('/restaurant/:id', userControllers.getRestaurant);
Router.get('/reservations', userControllers.getReservationsByDate);
Router.get('/getUserReservations/:userId', userControllers.getAllReservationsByUserId);
Router.get('/reservations/:userId', userControllers.getReservationByUserAndId);
Router.get('/reservations/:reservationId', userControllers.getReservationById);
Router.get('/reservations/restaurant/:restaurantId', userControllers.getReservationsByRestaurantId);
Router.get('/getUser/:id', userControllers.getUserProfile);


Router.post('/login', userControllers.userLogin);
Router.post('/register', userControllers.createUserAccount);
Router.post('/requestOTP', userControllers.requestOTP);
Router.post('/checkOTP', userControllers.checkOTP);
Router.post('/resetpassword', userControllers.resetPassword);
Router.post('/reservation/:userId', userControllers.createReservation);
Router.post('/restaurants/:restaurantId/reviews', userControllers.addReview);

Router.put('/:userId/reservations/:reservationId/block', userControllers.blockReservation);
Router.put('/users/:id', userControllers.updateUserProfile);

Router.delete('/deleteReservation', userControllers.deleteReservation);
Router.delete('/users/:id', userControllers.deleteUserAccount);
Router.delete('/restaurants/:restaurantId/reviews/:reviewId', userControllers.deleteReview);






// Add a restaurant to favorites
Router.post("/favorites/restaurant/:id", async (req, res) => {
    try {
        console.log(req.query.user)
        const user = await UserModel.findById(req.query.user);
        await user.addFavoriteRestaurant(req.params.id);
        res.status(200).send(user.favoriteRestaurants);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Remove a restaurant from favorites
Router.delete("/favorites/restaurant/:id", async (req, res) => {
    try {
        const user = await UserModel.findById(req.query.user);
        await user.removeFavoriteRestaurant(req.params.id);
        res.status(200).send(user.favoriteRestaurants);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Add a food item to favorites
Router.post("/favorites/restaurant/:restaurantId/food/:foodId", async (req, res) => {
    try {
        const user = await UserModel.findById(req.query.user);
        await user.addFavoriteFood(req.params.restaurantId, req.params.foodId);
      //  console.log(req.params.restaurantId, req.params.foodId, user)
        res.status(200).send(user.favoriteFoods);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Remove a food item from favorites
Router.delete("/favorites/restaurant/:restaurantId/food/:foodId", async (req, res) => {
    try {
        const user = await UserModel.findById(req.query.user);
        await user.removeFavoriteFood(req.params.restaurantId, req.params.foodId);
        res.status(200).send(user.favoriteFoods);
    } catch (error) {
        res.status(400).send(error.message);
    }
});


// Route to fetch user's favorite restaurants and foods
Router.get("/favourites", async (req, res) => {
    try {
        const user = await UserModel.findById(req.query.id)
            .populate("favoriteRestaurants")
            .exec();

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Fetch favorite foods with details for each referenced restaurant and food
        const favoriteFoodsDetails = await Promise.all(
            user.favoriteFoods.map(async (favoriteFood) => {
                try {
                    const restaurant = await Restaurant.findById(favoriteFood.restaurantId);
                    if (restaurant) {
                        const food = restaurant.foods.find(f => f.foodName === favoriteFood.foodName);
                        return food ? { restaurant: restaurant.restaurantName, food } : null;
                    }
                } catch (error) {
                    console.error(`Error fetching restaurant or food details:`, error);
                }
                return null;
            })
        );

        res.status(200).json({
            userStatus: user.blocked,
            favoriteRestaurants: user.favoriteRestaurants,
            favoriteFoods: favoriteFoodsDetails.filter(fav => fav !== null)
        });
    } catch (error) {
        console.error(`Error fetching user's favorites:`, error);
        res.status(500).send("An error occurred while fetching favorites");
    }
});



module.exports = Router