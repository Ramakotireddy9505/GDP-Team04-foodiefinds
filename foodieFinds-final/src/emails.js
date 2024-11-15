const nodemailer = require("nodemailer");
const dotenv=require('dotenv').config();
const sendEmail = process.env.EMAIL_ID
const mailPass = process.env.EMAIL_PASSWORD

const sendOTP = (email,OTP) => {
    const passwordMsg = {
        from: sendEmail,
        to: email,
        subject: `OTP From FoodieFinds`,
        html:`<div><h4>OTP to verify the mail in Foodie Finds is - ${OTP} .</h4> <br> <h5>Foodie Finds. <br>Thank You.</h5>`
     }

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: sendEmail,
            pass: mailPass
        }
    });

    return new Promise((resolve, reject) => {
        transporter.sendMail(passwordMsg, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("Email sent");
                resolve();
            }
        });
    });
};

const sendResetLink = (mail,link) => {
    const passwordMsg = {
        from:sendEmail,
        to: mail,
        subject: `Redox Game Account Reset Password Link`,
        html:`<div><h4>Hi User, Here is the link for reseting password of your account in Redox game\n <br> <br>The link is only vaild for 10 minutes. </h4><a href=${link}>Link</a>`
     }

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: sendEmail,
            pass: mailPass
        }
    });

    return new Promise((resolve, reject) => {
        transporter.sendMail(passwordMsg, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("Email sent");
                resolve();
            }
        });
    });
};

module.exports={
    sendOTP,
}