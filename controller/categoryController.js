const category = require('../model/categoryModel')
const AppError = require('../middleware/errorHandling')

const categoryPage = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1
    let limit = 10
    let skip = (page - 1) * limit
    let searchQuery = req.query.search || ''
    let regexPattern = new RegExp(searchQuery, 'i')
    let filter = searchQuery ? { categoryName: regexPattern } : {}
    const categories = await category
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    const totalUsers = await category.countDocuments()
    const totalPages = Math.ceil(totalUsers / limit)
    return res.render('admin/category', { categories, totalPages, page })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addCategory = async (req, res, next) => {
  try {
    const categoryCheck = await category.findOne({
      categoryName: {
        $regex: new RegExp('^' + req.body.categoryName + '$', 'i'),
      },
    })
    if (categoryCheck) {
      return res.status(208).send({ categoryExists: true })
    } else {
      const newCategory = new category({
        categoryName: req.body.categoryName,
        categoryDescription: req.body.categoryDescription,
      })
      newCategory.save()
      return res.status(200).send({ success: true })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const unListCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    await category.updateOne({ _id: categoryId }, { isListed: false })
    res.json({ success: true, message: 'Category Unlisted successfully.' })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to list category.' })
  }
}

const listCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    await category.updateOne({ _id: categoryId }, { isListed: true })
    res.json({ success: true, message: 'Category Listed successfully.' })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to unlist category.' })
  }
}

const editCategory = async (req, res, next) => {
  try {
    const categoryCheck = await category.find({
      categoryName: {
        $regex: new RegExp('^' + req.body.categoryName + '$', 'i'),
      },
    })
    if (
      (categoryCheck.length == 1 && req.body._id == categoryCheck[0]._id) ||
      categoryCheck.length == 0
    ) {
      await category.updateOne(
        { _id: req.body._id },
        {
          $set: {
            categoryName: req.body.categoryName,
            categoryDescription: req.body.categoryDescription,
          },
        }
      )
      res.json({ success: true, message: 'Category Edited successfully.' })
    } else {
      res.json({ success: false, message: 'Category already exits!' })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

module.exports = {
  categoryPage,
  addCategory,
  listCategory,
  unListCategory,
  editCategory,
}
