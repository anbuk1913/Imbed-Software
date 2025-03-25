const offer = require('../model/offerModel')
const product = require('../model/productModel')
const category = require('../model/categoryModel')
const usercollection = require('../model/userModel')
const AppError = require('../middleware/errorHandling')

const shopPage = async (req, res, next) => {
  try {
    let name = ''
    const offers = await offer.find({})
    let page = parseInt(req.query.page) || 1
    let limit = 12
    let skip = (page - 1) * limit
    const totalUsers = await product.countDocuments()
    const totalPages = Math.ceil(totalUsers / limit)
    const categories = await category.find({}).sort({ createdAt: -1 })
    const products = await product
      .find({})
      .populate({
        path: 'productCategoryId',
        select: 'categoryName isListed _id',
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
    for (let i of products) {
      for (let j of offers) {
        if (i.productCategoryId._id.toString() == j.categoryId.toString()) {
          const expiryDate = new Date(j.expiryDate)
          const today = new Date()
          const todayDateOnly = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          )
          if (expiryDate >= todayDateOnly) {
            const tem = Math.floor(
              i.productPrice - (i.productPrice * j.offerPercentage) / 100
            )
            if (i.productOfferPrice && i.productOfferPrice > tem) {
              i.productOfferPrice = tem
            } else {
              i.productOfferPrice = tem
            }
          }
          break
        }
      }
    }
    if (req.session.loginSession || req.session.signupSession) {
      const userEmail = req.session.user.email
      const userVer = await usercollection.findOne({ email: userEmail })
      if (userVer) {
        if (userVer.isActive == false) {
          req.session.block = true
          return res.redirect('/blocked')
        } else {
          name = userVer.name
          return res.render('user/shop', { name, products, categories, totalPages, page })
        }
      } else {
        return res.render('user/shop', { name, products, categories, totalPages, page })
      }
    } else {
      return res.render('user/shop', { name, products, categories, totalPages, page })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

module.exports = { shopPage }
