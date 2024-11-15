const express = require('express')
const Router = express.Router();
const multer = require('multer');
const Controllers = require('../Controllers/Controllers.js')
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { parse } = require('dotenv');

const dotenv=require('dotenv').config();

// Cloudinary Configuration
cloudinary.config({ 
    cloud_name: 'dv1kx7wef', 
    api_key: '679525356856359', 
    api_secret: 'yWG7PpLeZZkswCV-nBKmVlBvXUo' 
});

const upload = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "restaurants"
    }
});

const parser = multer({ storage: upload });

Router.get("/getAllUsers", Controllers.getAllUsers)
Router.get('/getRestaurants', Controllers.getRestaurants);
Router.get('/restaurant/:id', Controllers.getRestaurant);
Router.get('/getAllReservations', Controllers.getAllReservations);

Router.post('/login', Controllers.adminLogin);
Router.post('/register', Controllers.createAdminAccount);
Router.post('/requestOTP', Controllers.requestOTP);
Router.post('/checkOTP', Controllers.checkOTP);
Router.post('/resetpassword', Controllers.resetPassword);
Router.post('/addRestaurant', parser.single('imageFile'), Controllers.addRestaurant);
Router.post('/addfood', parser.single('image'), Controllers.addFood);

Router.put('/editRestaurant/:id', Controllers.editRestaurant);
Router.put('/unblockUser', Controllers.unblockUser);

Router.delete('/blockUser', Controllers.blockUser);
Router.delete('/deleteRestaurant/:id', Controllers.deleteRestaurant);
Router.delete('/deleteRestaurantFood', Controllers.deleteRestaurantFood); 

module.exports = Router