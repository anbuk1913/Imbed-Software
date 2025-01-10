const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
     productName: {
          type: String,
          required: true,
     },
     productDescription: {
          type: String,
     },
     productStock: {
          type: Number,
          required: true,
     },
     productPrice: {
          type: Number,
          required: true,
     },
     productOfferPrice: {
          type: Number,
     },
     productImage1: {
          type: String,
     },
     productImage2: {
          type: String,
     },
     productImage3: {
          type: String,
     },
     productCategory: {
          type: String,
          required: true,
     },
     isListed: {
          type: Boolean,
          default: true,
     },
});

const product = mongoose.model("product", productSchema);
module.exports = product;
