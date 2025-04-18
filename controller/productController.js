const offer = require('../model/offerModel')
const product = require('../model/productModel')
const review = require('../model/productReview')
const wishlist = require('../model/wishlistModel')
const category = require('../model/categoryModel')
const usercollection = require('../model/userModel')
const AppError = require('../middleware/errorHandling')
const path = require('path')
const fs = require('fs')

const productPage = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1
    let limit = 10
    let skip = (page - 1) * limit
    let searchQuery = req.query.search || ''
    let regexPattern = new RegExp(searchQuery, 'i')
    let filter = searchQuery ? { productName: regexPattern } : {}
    const totalUsers = await product.countDocuments()
    const totalPages = Math.ceil(totalUsers / limit)
    const products = await product
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'productCategoryId',
        select: 'categoryName -_id',
      })
      .sort({ createdAt: -1 })
    return res.render('admin/product', { products, page, totalPages })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addProduct = async (req, res, next) => {
  try {
    const categories = await category.find({}).sort({ createdAt: -1 })
    res.render('admin/addProduct', { categories })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addProductPost = async (req, res, next) => {
  try {
    const productCheck = await product.findOne({
      productName: {
        $regex: new RegExp('^' + req.body.productName + '$', 'i'),
      },
    })

    if (productCheck) {
      return res
        .status(208)
        .send({ productExits: true, message: 'Product Already Exits!' })
    } else {
      const {
        productName,
        productDescription,
        productPrice,
        productOfferPrice,
        productStock,
        productCategoryId,
      } = req.body
      // Handle images (Multer automatically saves files to the 'uploads' directory)
      const images = req.files
      const productImages = {}

      // Check for the presence of image files and store their paths
      if (images['productImage1']) {
        productImages.productImage1 = `/uploads/${images['productImage1'][0].filename}`
      }
      if (images['productImage2']) {
        productImages.productImage2 = `/uploads/${images['productImage2'][0].filename}`
      }
      if (images['productImage3']) {
        productImages.productImage3 = `/uploads/${images['productImage3'][0].filename}`
      }

      // Create a new product document
      const newProduct = new product({
        productName,
        productDescription,
        productPrice,
        productOfferPrice,
        productStock,
        productCategoryId,
        productImage1: productImages.productImage1 || '',
        productImage2: productImages.productImage2 || '',
        productImage3: productImages.productImage3 || '',
      })

      // Save the product to the database
      await newProduct.save()

      // Respond with success
      return res.json({ success: true, message: 'Product Added successfully!' })
    }
  } catch (error) {
    console.log('Error adding product:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const productEdit = async (req, res, next) => {
  try {
    const id = req.params.id
    const products = await product.findById({ _id: id }).populate({
      path: 'productCategoryId',
      select: 'categoryName -_id',
    })
    const categories = await category.find({}).sort({ createdAt: -1 })
    if (products) {
      return res.render('admin/editProduct', { products, categories })
    } else {
      return res.redirect('/admin/product')
    }
  } catch (error) {
    console.log('Error adding product:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const productEditPost = async (req, res, next) => {
  try {
    const productCheck = await product.find({
      productName: {
        $regex: new RegExp('^' + req.body.productName + '$', 'i'),
      },
    })
    if (
      (productCheck.length == 1 && req.body._id == productCheck[0]._id) ||
      productCheck.length == 0
    ) {
      const images = req.files
      const productImages = {}
      await product.updateOne(
        { _id: req.body._id },
        {
          $set: {
            productName: req.body.productName,
            productCategoryId: req.body.productCategoryId,
            productPrice: req.body.productPrice,
            productOfferPrice: req.body.productOfferPrice,
            productStock: req.body.productStock,
            productDescription: req.body.productDescription,
          },
        }
      )
      if (images['productImage1']) {
        productImages.productImage1 = `/uploads/${images['productImage1'][0].filename}`
        await product.updateOne(
          { _id: req.body._id },
          {
            $set: {
              productImage1: productImages.productImage1 || '',
            },
          }
        )
      }
      if (images['productImage2']) {
        productImages.productImage2 = `/uploads/${images['productImage2'][0].filename}`
        await product.updateOne(
          { _id: req.body._id },
          {
            $set: {
              productImage2: productImages.productImage2 || '',
            },
          }
        )
      }
      if (images['productImage3']) {
        productImages.productImage3 = `/uploads/${images['productImage3'][0].filename}`
        await product.updateOne(
          { _id: req.body._id },
          {
            $set: {
              productImage3: productImages.productImage3 || '',
            },
          }
        )
      }
      return res.json({
        success: true,
        message: 'Product Edited successfully!',
      })
    } else {
      return res
        .status(208)
        .send({ productExits: true, message: 'Product Already Exits!' })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const unListProduct = async (req, res, next) => {
  try {
    const productId = req.params.id
    await product.updateOne({ _id: productId }, { isListed: false })
    res.json({ success: true, message: 'Product Unlisted successfully.' })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to list category.' })
  }
}

const listProduct = async (req, res, next) => {
  try {
    const productId = req.params.id
    await product.updateOne({ _id: productId }, { isListed: true })
    res.json({ success: true, message: 'Product Listed successfully.' })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to unlist category.' })
  }
}

const singleProductView = async (req, res, next) => {
  try {
    let name = ''
    let userId = ''
    let wishlistProduct = false
    const products = await product.findOne({ _id: req.params.id }).populate({
      path: 'productCategoryId',
      select: 'categoryName categoryDescription _id',
    })

    // Fetch all reviews for this product
    const reviews = await review.find({ productId:req.params.id })
      .populate('userId', 'name') // Optional: populate user's name
      .sort({ createdAt: -1 });

    const ratingCounts = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    };

    let totalRating = 0;

    reviews.forEach(review => {
      const rating = review.rating;
      totalRating += rating;
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews ? (totalRating / totalReviews).toFixed(1) : 0;

    const relatedProducts = await product
      .find({ productCategoryId: products.productCategoryId._id })
      .populate({
        path: 'productCategoryId',
        select: 'categoryName categoryDescription isListed _id',
      })
      .limit(4)
    if (products) {
      const offers = await offer.findOne({
        categoryId: products.productCategoryId._id,
      })
      if (offers) {
        const expiryDate = new Date(offers.expiryDate)
        const today = new Date()
        const todayDateOnly = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        )
        if (expiryDate >= todayDateOnly) {
          const tem = Math.floor(
            products.productPrice -
              (products.productPrice * offers.offerPercentage) / 100
          )
          if (products.productOfferPrice && products.productOfferPrice > tem) {
            products.productOfferPrice = tem
          } else {
            products.productOfferPrice = tem
          }
        }
      }
      if (req.session.loginSession || req.session.signupSession) {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail })
        const isWishlist = await wishlist.findOne({
          userId: userVer._id,
          productId: products._id,
        })
        if (isWishlist) wishlistProduct = true
        if (userVer) {
          if (userVer.isActive == false) {
            req.session.block = true
            return res.redirect('/blocked')
          } else {
            name = userVer.name
            userId = userVer._id
            return res.render('user/product', {
              name,
              reviews,
              products,
              userId,
              reviews,
              totalReviews,
              averageRating,
              ratingCounts,
              wishlistProduct,
              relatedProducts,
            })
          }
        } else {
          return res.render('user/product', {
            name,
            reviews,
            products,
            userId,
            reviews,
            totalReviews,
            averageRating,
            ratingCounts,
            wishlistProduct,
            relatedProducts,
          })
        }
      } else {
        return res.render('user/product', {
          name,
          products,
          userId,
          reviews,
          totalReviews,
          averageRating,
          ratingCounts,
          wishlistProduct,
          relatedProducts,
        })
      }
    } else {
      next(new AppError('Product Not Found', 400))
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const deleteProduct = async (req, res, next) => {
  try {
    const id = req.query.productId
    const data = await product.findByIdAndDelete({ _id: id })
    if (!data) {
      return res.json({ success: false })
    }
    res.json({ success: true })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

module.exports = {
  productPage,
  addProduct,
  addProductPost,
  productEdit,
  productEditPost,
  unListProduct,
  listProduct,
  singleProductView,
  deleteProduct,
}
