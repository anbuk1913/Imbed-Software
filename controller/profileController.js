const usercollection = require('../model/userModel')
const wallet = require('../model/walletModel')
const address = require('../model/address')
const AppError = require('../middleware/errorHandling')
const Razorpay = require('razorpay')
const fs = require('fs')
const bcrypt = require('bcrypt')

const {
  validateWebhookSignature,
} = require('razorpay/dist/utils/razorpay-utils')

const razorPay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
})

const readData = () => {
  if (fs.existsSync('order.json')) {
    const data = fs.readFileSync('order.json')
    return JSON.parse(data)
  }
  return []
}

const writeData = (data) => {
  fs.writeFileSync('orders.json', JSON.stringify(data, null, 2))
}

if (!fs.existsSync('orders.json')) {
  writeData([])
}

async function encryptPassword(password) {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  return hashedPassword
}

async function comparePassword(enteredPassword, storedPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, storedPassword)
  return isMatch
}

const profile = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    if (!userVer.isActive) {
      return res.redirect('/blocked')
    } else {
      return res.render('user/profile', { userVer })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const editProfile = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    await cart.updateOne(
      { _id: userVer._id },
      {
        $set: {
          name: req.body.userId,
          productId: req.body.productId,
          productQuantity: req.body.productQuantity,
        },
      }
    )
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addressPage = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    const userAddress = await address.find({ userId: userVer._id })
    res.render('user/address', { userVer, userAddress })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addAddress = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    res.render('user/addAddress', { userVer })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addAddressPost = async (req, res, next) => {
  try {
    const addressCount = await address.countDocuments({
      userId: req.body.userId,
    })
    const newaddress = new address({
      userId: req.body.userId,
      addressCount: addressCount + 1,
      doorNo: req.body.doorNo,
      city: req.body.city,
      street: req.body.street,
      district: req.body.district,
      pinCode: req.body.pinCode,
    })
    newaddress.save()
    return res
      .status(200)
      .send({ success: true, message: 'Address Added Successfully!' })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const editAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    const addressData = await address.findById({ _id: addressId })
    if (addressData) {
      return res.render('user/editAddress', { addressData, userVer })
    } else {
      return res.redirect('/address')
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const editAddressPut = async (req, res, next) => {
  try {
    console.log(req.body)
    await address.updateOne(
      { _id: req.body._id },
      {
        $set: {
          doorNo: req.body.doorNo,
          street: req.body.street,
          city: req.body.city,
          district: req.body.district,
          pinCode: req.body.pinCode,
        },
      }
    )
    return res.json({ success: true, message: 'Address Edited Successfully!' })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const deleteAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id
    const addressNum = await address.findOne({ _id: addressId })
    const results = await address.updateMany(
      {
        userId: addressNum.userId,
        addressCount: { $gt: addressNum.addressCount },
      },
      { $inc: { addressCount: -1 } }
    )
    const data = await address.findByIdAndDelete({ _id: addressId })
    if (data) {
      return res.json({
        success: true,
        message: 'Address deleted Successfully!',
      })
    } else {
      return res.json({ success: false, message: 'Somthing Wrong!' })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const changePassword = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    if (userVer.password) {
      return res.render('user/changePassword', { userVer })
    } else {
      return res.redirect('/profile')
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const changePasswordPatch = async (req, res, next) => {
  try {
    const user = await usercollection.findOne({ email: req.session.user.email })
    if (await comparePassword(req.body.oldPassword, user.password)) {
      const newHashedPass = await encryptPassword(req.body.newPassword)
      await usercollection.updateOne(
        { email: req.session.user.email },
        { $set: { password: newHashedPass } }
      )
      return res.json({ success: true, message: 'Password Changed!' })
    } else {
      return res.json({ success: false, message: 'Incorrect Old password!' })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const editUserData = async (req, res, next) => {
  try {
    await usercollection.updateOne(
      { email: req.session.user.email },
      { $set: { name: req.body.name, phone: req.body.phone } }
    )
    return res.json({ success: true, message: 'Pofile Updated!' })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

// Wallet
const walletPage = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    let walletData = await wallet.findOne({ userId: userVer._id })
    walletData.walletBalance = Math.floor(walletData.walletBalance * 100) / 100
    return res.render('user/wallet', { userVer, walletData })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const addMoney = async (req, res, next) => {
  try {
    const { amount, currency, receipt, notes } = req.body
    const options = {
      amount: amount,
      currency,
      receipt,
      notes,
    }
    const order = await razorPay.orders.create(options)
    const orders = readData()
    orders.push({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: 'created',
    })
    writeData(orders)
    res.json({ order, key: process.env.KEY_ID })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const verifyPayments = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } =
    req.body
  const secret = process.env.KEY_SECRET
  const body = razorpay_order_id + '|' + razorpay_payment_id
  try {
    const userVer = await usercollection.findOne({
      email: req.session.user.email,
    })
    const isValidSignature = validateWebhookSignature(
      body,
      razorpay_signature,
      secret
    )
    if (isValidSignature) {
      const orders = readData()
      const order = orders.find((o) => o.order_id === razorpay_order_id)
      if (order) {
        order.status = 'paid'
        order.payment_id = razorpay_payment_id
        writeData(orders)
      }
      const transactionData = {
        transactionDate: new Date(),
        transactionAmount: amount / 100,
        transactionType: 'Money from Razorpay',
      }
      const changes = amount / 100
      await wallet.updateOne(
        { userId: userVer._id },
        {
          $inc: { walletBalance: changes },
          $push: { walletTransaction: transactionData },
        },
        { new: true }
      )
      res.status(200).json({ status: 'ok' })
      console.log('Payment verification successful')
    } else {
      res.status(400).json({ status: 'verification failed' })
      console.log('Payment verification failed')
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

module.exports = {
  profile,
  editProfile,
  addressPage,
  addAddress,
  addAddressPost,
  editAddress,
  editAddressPut,
  deleteAddress,
  changePassword,
  changePasswordPatch,
  editUserData,
  walletPage,
  addMoney,
  verifyPayments,
}
