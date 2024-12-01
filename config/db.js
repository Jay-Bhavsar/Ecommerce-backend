const mongoose = require('mongoose')



const connectDb = async () => { 
    mongoose.connect('mongodb://localhost:27017/ecommerce')
    .then(() => {
    console.log("MongoDB connected");
    })
    .catch((err) => {
    console.log("MongoDB connection error:", err);
    });
}


module.exports = connectDb
