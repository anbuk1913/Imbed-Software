const mongoose = require('mongoose')

const wishSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const wishlist = mongoose.model('wishlist', wishSchema)
module.exports = wishlist
