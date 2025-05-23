const coupon = require('../model/couponModel')
const AppError = require('../middleware/errorHandling')

const couponPage = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1
    let limit = 10
    let skip = (page - 1) * limit
    let searchQuery = req.query.search || ''
    let regexPattern = new RegExp(searchQuery, 'i')
    let filter = searchQuery ? { code: regexPattern } : {}
    const coupons = await coupon
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    const totalUsers = await coupon.countDocuments()
    const totalPages = Math.ceil(totalUsers / limit)
    res.render('admin/coupons', { coupons, page, totalPages })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addCoupon = async (req, res, next) => {
  try {
    const couponCheck = await coupon.findOne({
      code: { $regex: new RegExp('^' + req.body.code + '$', 'i') },
    })
    if (couponCheck) {
      return res
        .status(208)
        .send({ success: false, message: 'Coupon Code Already Exits!' })
    } else {
      const newCoupon = new coupon({
        code: req.body.code,
        percentage: req.body.percentage,
        startDate: req.body.startDate,
        expiryDate: req.body.expiryDate,
        minPurchase: req.body.minPurchase,
        maxDiscount: req.body.maxDiscount,
      })
      const response = newCoupon.save()
      if (response) {
        return res
          .status(200)
          .send({ success: true, message: 'Coupon Added Successfully!' })
      } else {
        return res
          .status(208)
          .send({ success: false, message: 'Somthing Wrong!' })
      }
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const editCoupon = async (req, res, next) => {
  try {
    const couponCheck = await coupon.find({
      code: { $regex: new RegExp('^' + req.body.code + '$', 'i') },
    })
    if (
      (couponCheck.length == 1 && req.body.id == couponCheck[0]._id) ||
      couponCheck.length == 0
    ) {
      await coupon.updateOne(
        { _id: req.body.id },
        {
          $set: {
            code: req.body.code,
            percentage: req.body.percentage,
            startDate: req.body.startDate,
            expiryDate: req.body.expiryDate,
            minPurchase: req.body.minPurchase,
            maxDiscount: req.body.maxDiscount,
          },
        }
      )
      return res.json({ success: true, message: 'Coupon Edited successfully!' })
    } else {
      return res
        .status(208)
        .send({ success: false, message: 'Coupon Code Already Exits!' })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const deleteCoupon = async (req, res, next) => {
  const id = req.query.couponid
  const data = await coupon.findByIdAndDelete({ _id: id })
  if (!data) {
    return res.json({ success: false })
  }
  res.json({ success: true })
}

module.exports = { couponPage, addCoupon, editCoupon, deleteCoupon }
