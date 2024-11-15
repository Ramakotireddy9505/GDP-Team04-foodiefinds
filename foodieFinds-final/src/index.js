const express = require('express');
const server = express();
const path=require('path');
const dotenv=require('dotenv').config();
const port = process.env.PORT
const userRoutes = require('./Routes/userRouter.js');
const adminRoutes = require('./Routes/adminRouter.js');
const connectMongoDb = require('./database/mongoose.js');
const updateAllReservationsStatuses = require('./updateReservations.js')

server.get('/test', (req,res) => {
    res.send({response : "Server is running"});
});

const adminFolder=path.join(__dirname,'../admin')
const publicFolder=path.join(__dirname,'../public');

server.use(express.static(publicFolder));
server.use('/admin', express.static(adminFolder));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use('/user', userRoutes);
server.use('/admin', adminRoutes);


connectMongoDb().then(() => {
    updateAllReservationsStatuses();
    server.listen(port, () => {
        console.log(`=>> http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Unable to connect database', err);
    process.exit(1);
});

