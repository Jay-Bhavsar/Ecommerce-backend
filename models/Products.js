const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Category model
    ref: "Category", // Model to populate from
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    rate: {
      type: Number,
      required: false,
    },
    count: {
      type: Number,
      required: false,
    },
  },
});

module.exports = mongoose.model("Product", productSchema);
