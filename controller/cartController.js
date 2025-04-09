const cart = require('../model/cartModel')
const offer = require('../model/offerModel')
const usercollection = require('../model/userModel')
const AppError = require('../middleware/errorHandling')

const cartView = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    const name = userVer.name
    let cartItems = await cart
      .find({ userId: userVer._id })
      .populate({
        path: 'productId',
        select:
          'productName productPrice productOfferPrice productImage1 isListed productStock productCategoryId _id',
      })
      .sort({ createdAt: -1 })
    cartItems = cartItems.map((item) => {
      const productStock = item.productId?.productStock || 100 // Default stock if undefined
      item.productQuantity = Math.min(item.productQuantity, productStock) // Adjust quantity to stock
      return item
    })
    const offers = await offer.find({})
    for (let i of cartItems) {
      for (let j of offers) {
        if (
          i.productId.productCategoryId.toString() == j.categoryId.toString()
        ) {
          const expiryDate = new Date(j.expiryDate)
          const today = new Date()
          const todayDateOnly = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          )
          if (expiryDate >= todayDateOnly) {
            const tem = Math.floor(
              i.productId.productPrice -
                (i.productId.productPrice * j.offerPercentage) / 100
            )
            if (
              i.productId.productOfferPrice &&
              i.productId.productOfferPrice > tem
            ) {
              i.productId.productOfferPrice = tem
            } else {
              i.productId.productOfferPrice = tem
            }
          }
          break
        }
      }
    }
    return res.render('user/cart', { name, cartItems })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addtoCart = async (req, res, next) => {
  try {
    await cart.updateOne(
      { userId: req.body.userId, productId: req.body.productId },
      {
        $set: {
          userId: req.body.userId,
          productId: req.body.productId,
          productQuantity: req.body.productQuantity,
        },
      },
      { upsert: true }
    )
    res.json({ success: true, message: 'Product Added to Cart successfully.' })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const removeItem = async (req, res, next) => {
  try {
    const id = req.query.id
    const data = await cart.findByIdAndDelete({ _id: id })
    if (data) {
      return res.json({ success: true, message: 'Product removed' })
    } else {
      return res.json({ success: false, message: 'Somthing Wrong!' })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const updateCartItems = async (req, res) => {
  try {
    for (const data of req.body.arr) {
      if (data.productId.length != 24) {
        continue
      }
      await cart.updateOne(
        { _id: data.productId },
        { $set: { productQuantity: data.value } }
      )
    }
    req.session.checkOne = true
    res.json({ success: true })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

module.exports = { cartView, addtoCart, removeItem, updateCartItems }
