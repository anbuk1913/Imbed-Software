const offer = require('../model/offerModel')
const category = require('../model/categoryModel')
const AppError = require('../middleware/errorHandling')

const offerPage = async (req, res, next) => {
  try {
    const categoryOffer = await offer
      .find({})
      .populate({
        path: 'categoryId',
        select: 'categoryName isListed _id',
      })
      .sort({ createdAt: -1 })
    const categories = await category.find({})
    return res.render('admin/offer', { categoryOffer, categories })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addOffer = async (req, res, next) => {
  try {
    const categoryCheck = await offer.findOne({
      categoryId: req.body.categoryName,
    })
    if (categoryCheck) {
      return res
        .status(208)
        .send({ success: false, message: 'Category Already Exits' })
    } else {
      const offerData = new offer({
        categoryId: req.body.categoryName,
        offerPercentage: req.body.offerPercentage,
        startDate: req.body.startDate,
        expiryDate: req.body.expiryDate,
      })
      offerData.save()
      return res
        .status(200)
        .send({ success: true, message: 'Offer Added Successfully!' })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const editOffer = async (req, res, next) => {
  try {
    const offerId = req.body.offerId
    const categoryId = req.body.categoryName
    const offerPercentage = req.body.offerPercentage
    const startDate = req.body.startDate
    const expiryDate = req.body.expiryDate
    const offerCheck = await offer.find({ categoryId: categoryId })
    if (
      (offerCheck.length == 1 && offerId == offerCheck[0]._id) ||
      offerCheck.length == 0
    ) {
      await offer.updateOne(
        { _id: offerId },
        {
          $set: {
            categoryId: categoryId,
            offerPercentage: offerPercentage,
            startDate: startDate,
            expiryDate: expiryDate,
          },
        }
      )
      res.json({ success: true, message: 'Offer Edited successfully.' })
    } else {
      res.json({ success: false, message: 'Category Offer already exits!' })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

module.exports = { offerPage, addOffer, editOffer }
