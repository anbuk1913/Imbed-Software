const cart = require('../model/cartModel')
const offer = require('../model/offerModel')
const wishlist = require('../model/wishlistModel')
const usercollection = require('../model/userModel')
const AppError = require('../middleware/errorHandling')

const wishlistPage = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    const name = userVer.name
    let products = await wishlist
      .find({ userId: userVer._id })
      .populate({
        path: 'productId',
        select:
          'productName productPrice productOfferPrice productImage1 productCategoryId isListed productStock _id',
      })
      .sort({ createdAt: -1 })
    const offers = await offer.find({})
    for (let i of products) {
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
    res.render('user/wishlist', { name, products, userVer })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const editWishlist = async (req, res, next) => {
  try {
    if (req.body.wishlist) {
      newData = new wishlist({
        userId: req.body.userId,
        productId: req.body.productId,
      })
      await newData.save()
      return res.status(200).send({ success: true })
    } else {
      await wishlist.deleteOne({
        userId: req.body.userId,
        productId: req.body.productId,
      })
      return res.status(200).send({ success: true })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const deleteProduct = async (req, res, next) => {
  try {
    const data = await wishlist.deleteOne({
      userId: req.body.userId,
      productId: req.body.productId,
    })
    if (data.deletedCount != 0) {
      return res.json({ success: true, message: 'Product removed' })
    } else {
      return res.json({ success: false, message: 'Somthing Wrong!' })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addAlltoCart = async (req, res, next) => {
  try {
    const wishlistData = await wishlist.find({ userId: req.body.userId })
    for (let i of wishlistData) {
      await cart.updateOne(
        { userId: i.userId, productId: i.productId },
        { $set: { userId: i.userId, productId: i.productId } },
        { upsert: true }
      )
    }
    return res.json({ success: true, message: 'Products added to cart!' })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

module.exports = { wishlistPage, editWishlist, deleteProduct, addAlltoCart }
