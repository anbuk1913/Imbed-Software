const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    reviewContent: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const review = mongoose.model('review', reviewSchema)
module.exports = review