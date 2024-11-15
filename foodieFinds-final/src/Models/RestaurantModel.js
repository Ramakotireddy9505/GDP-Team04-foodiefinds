const mongoose = require('mongoose');

// Food Schema
const foodSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true }
});

// Reviews Schema
const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  date: { type: Date, default: Date.now }
});

//Restaurants Schema
const restaurantSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  imageUrl: { type: String },
  address: { type: String, required: true },
  rating: { type: Number, default: 1, min: 1, max: 5 },
  restaurantType: {type: String,},
  feedback: { type: String },
  reviews: [reviewSchema],
  foods: [foodSchema],
  openingHours: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  reservationsAvailable: {
    type: Boolean,
    default: true
  }
});


// Method to find a restaurant by ID
restaurantSchema.statics.findRestaurantById = async function (restaurantId) {
    try {
      const restaurant = await this.findById(restaurantId);
      return restaurant;
    } catch (error) {
      throw new Error('Restaurant not found');
    }
  };
  
  // Method to find a restaurant by Name
  restaurantSchema.statics.findRestaurantByName = async function (restaurantName) {
    try {
      const restaurant = await this.findOne({ restaurantName: restaurantName });
      return restaurant;
    } catch (error) {
      throw new Error('Restaurant not found');
    }
  };
  
  // Method to find food by name in a specific restaurant
restaurantSchema.methods.findFoodByName = function (foodName) {
    const food = this.foods.find(food => food.name.toLowerCase() === foodName.toLowerCase());
    return food ? food : null;
  };
  
  // Method to find food by food ID in a specific restaurant
  restaurantSchema.methods.findFoodById = function (foodId) {
    const food = this.foods.id(foodId);
    return food ? food : null;
  };
  

const RestaurantModel = mongoose.model('Restaurant', restaurantSchema);

module.exports = RestaurantModel;
