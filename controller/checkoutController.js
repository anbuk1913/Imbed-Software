const cart = require('../model/cartModel')
const offer = require('../model/offerModel')
const usercollection = require('../model/userModel')
const address = require('../model/address')
const order = require('../model/orders')
const product = require('../model/productModel')
const coupon = require('../model/couponModel')
const Razorpay = require('razorpay')
const fs = require('fs')
const wallet = require('../model/walletModel')
const AppError = require('../middleware/errorHandling')

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

function generateOrderID() {
  let randomLetters = ''
  for (let i = 0; i < 3; i++) {
    randomLetters += String.fromCharCode(65 + Math.floor(Math.random() * 26))
  }
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.floor(100000 + Math.random() * 900000)
  return `${randomLetters}-${datePart}-${randomPart}`
}

const checkoutPageOne = async (req, res, next) => {
  try {
    if (req.session.checkOne) {
      const userEmail = req.session.user.email
      const userVer = await usercollection.findOne({ email: userEmail })
      const addressCollection = await address.find({ userId: userVer._id })
      const name = userVer.name
      return res.render('user/checkout_1', { userVer, name, addressCollection })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const checkoutTwoPost = async (req, res, next) => {
  try {
    req.session.firstName = req.body.firstName
    req.session.lastName = req.body.lastName
    req.session.phone = req.body.phone
    req.session.email = req.session.user.email
    req.session.orderNotes = req.body.orderNotes
    if (req.body.address != 'new') {
      req.session.addressId = req.body.address
    } else {
      req.session.doorNums = req.body.doorNum
      req.session.street = req.body.street
      req.session.city = req.body.city
      req.session.district = req.body.district
      req.session.postcode = req.body.postcode
    }
    return res.redirect('/billing')
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const billingPage = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    const name = userVer.name
    return res.render('user/checkout_2', { userVer, name })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const billingMethodPost = async (req, res, next) => {
  try {
    req.session.billingMethode = req.body.shipping
    return res.redirect('/payment')
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const paymentPage = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    const name = userVer.name
    return res.render('user/checkout_3', { userVer, name })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const paymentMethod = async (req, res, next) => {
  try {
    req.session.paymentMethod = req.body.payment
    return res.redirect('/review')
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const finalReview = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    const name = userVer.name
    let cartItems = await cart.find({ userId: userVer._id }).populate({
      path: 'productId',
      select:
        'productName productPrice productOfferPrice productImage1 productCategoryId isListed productStock _id',
    })
    cartItems = cartItems.map((item) => {
      const productStock = item.productId?.productStock || 100 // Default stock if undefined
      item.productQuantity = Math.min(item.productQuantity, productStock) // Adjust quantity to stock
      return item
    })
    const deliveryFee = {
      datas: req.session.billingMethode,
      coupon: req.session.coupon,
      couponCode: req.session.couponCode,
    }
    const paymentMethod = req.session.paymentMethod
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
    let total = cartItems.reduce((acc,cur)=>{
        if(cur.productId.productOfferPrice){
            return acc+cur.productId.productOfferPrice
        } else {
            return acc+cur.productId.productPrice
        }
    },0)
    
    const today = new Date();
    let availableCoupon = await coupon.find({minPurchase: {
        $gte: total - 500,
        $lte: total + 500
      },
        expiryDate: {
        $gte: today
      }
    }).limit(3)

    let walletData = await wallet.findOne({ userId: userVer._id })
    walletAmount = Math.floor(walletData.walletBalance * 100) / 100
    res.render('user/checkout_4', {
      name,
      cartItems,
      deliveryFee,
      paymentMethod,
      walletAmount,
      availableCoupon,
    })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const finalQuantityCheck = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    let cartItems = await cart.find({ userId: userVer._id }).populate({
      path: 'productId',
      select:
        'productName productPrice productOfferPrice productImage1 isListed productStock _id',
    })
    for (let i = 0; i < cartItems.length; i++) {
      if (cartItems[i]?.productQuantity > cartItems[i]?.productId?.productStock && cartItems[i]?.productId?.isListed){
        return res.json({
          success: false,
          title: "Stock Unavailable!",
          message: `${cartItems[i].productId?.productName} Only ${cartItems[i].productId?.productStock} left in stock!`,
        })
      }
    }
    if (req.session.couponCode) {
      const couponCheck = await coupon.findOne({ code: req.session.couponCode })
      if (couponCheck) {
        if (couponCheck.minPurchase) {
          const userEmail = req.session.user.email
          const userVer = await usercollection.findOne({ email: userEmail })
          let cartItems = await cart.find({ userId: userVer._id }).populate({
            path: 'productId',
            select:
              'productName productPrice productOfferPrice productImage1 isListed productStock _id',
          })
          cartItems = cartItems.map((item) => {
            const productStock = item.productId?.productStock || 100 // Default stock if undefined
            item.productQuantity = Math.min(item.productQuantity, productStock) // Adjust quantity to stock
            return item
          })
          let total = 0
          for (let i = 0; i < cartItems.length; i++) {
            let t = 0
            if (cartItems[i].productId.productOfferPrice) {
              t = cartItems[i].productId.productOfferPrice
            } else {
              t = cartItems[i].productId.productPrice
            }
            total += t * cartItems[i].productQuantity
          }
          if (
            total * 1.18 + Number(req.session.billingMethode) <
            couponCheck.minPurchase
          ) {
            req.session.coupon = null
            req.session.couponCode = null
            return res
              .status(208)
              .send({
                success: false,
                title: 'Coupon not Applied',
                message: `This Coupon applicable on transactions above ₹${couponCheck.minPurchase}!`,
              })
          }
        }
      }
    }
    return res.json({ success: true })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const orderPost = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    let placedAddress = {}
    let priceDetail = {
      subTotal: req.body.subTotal,
      delivery: req.body.delivery,
      gst: req.body.gst,
      coupon: req.body.coupon ?? 0,
      total: req.body.total,
    }
    if (req.session.addressId) {
      const orderAddress = await address.findOne({ _id: req.session.addressId })
      placedAddress = {
        doorNo: orderAddress.doorNo,
        street: orderAddress.street,
        city: orderAddress.city,
        district: orderAddress.district,
        pinCode: orderAddress.pinCode,
      }
    } else {
      placedAddress = {
        doorNo: req.session.doorNums,
        street: req.session.street,
        city: req.session.city,
        district: req.session.district,
        pinCode: req.session.postcode,
      }
      const addressCount = await address.countDocuments({ userId: userVer._id })
      const newaddress = new address({
        userId: userVer._id,
        addressCount: addressCount + 1,
        doorNo: req.session.doorNums,
        street: req.session.street,
        city: req.session.city,
        district: req.session.district,
        pinCode: req.session.postcode,
      })
      newaddress.save()
    }

    let cartItems = await cart.find({ userId: userVer._id }).populate({
      path: 'productId',
      select:
        'productName productPrice productOfferPrice productImage1 productCategoryId isListed productStock _id',
    })

    cartItems = cartItems.filter((product => product.productId?.isListed))

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

    let productDetails = []
    let totalDiscountAmount = 0
    for (let i = 0; i < cartItems.length; i++) {
      let price = 0
      if (cartItems[i].productId?.productOfferPrice) {
        price = cartItems[i].productId.productOfferPrice
        totalDiscountAmount +=
          (cartItems[i].productId.productPrice -
            cartItems[i].productId.productOfferPrice) *
          cartItems[i].productQuantity
      } else {
        price = cartItems[i].productId.productPrice
      }
      let obj = {
        productId: cartItems[i].productId._id,
        productName: cartItems[i].productId.productName,
        productPrice: price,
        quantity: cartItems[i].productQuantity,
      }
      productDetails.push(obj)
    }

    totalDiscountAmount += req.body.coupon ?? 0
    priceDetail.totalDiscountAmount = totalDiscountAmount

    const orderId = generateOrderID()
    if(req.session.paymentMethod == "Wallet"){
      const transactionData = {
        transactionDate: new Date(),
        transactionAmount: priceDetail.total,
        transactionType: 'Debit for Order',
      }
      await wallet.updateOne(
        { userId: userVer._id },
        {
          $inc: { walletBalance: Number(- priceDetail.total) },
          $push: { walletTransaction: transactionData },
        },
        { new: true }
      )
    }
    const orders = new order({
      userId: userVer._id,
      orderId: orderId,
      address: placedAddress,
      fullName: req.session.firstName + ' ' + req.session.lastName,
      phone: req.session.phone,
      email: req.session.email,
      paymentMethod: req.session.paymentMethod,
      orderNotes: req.session.orderNotes,
      totalDiscountAmount: totalDiscountAmount,
      priceDetails: priceDetail,
      products: productDetails,
    })
    for (let i = 0; i < cartItems.length; i++) {
      const count = -cartItems[i].productQuantity
      const id = cartItems[i].productId
      await product.updateOne(
        { _id: id },
        { $inc: { productStock: count, salesCount: -count } }
      )
    }
    let amounts
    if (req.body.coupon) {
      amounts = Number(req.body.coupon)
    } else {
      amounts = 0
    }
    amounts = -amounts
    await order.deleteOne({ _id: req.session.failPaymentId })
    await cart.deleteMany({ userId: userVer._id })
    await coupon.updateOne(
      { code: req.session.couponCode },
      {
        $inc: { usedCount: 1, totalDiscount: amounts },
        $push: { usedBy: userVer._id },
      }
    )
    let newID = await orders.save()
    req.session.orderId = newID.orderId
    req.session.subTotal = null
    req.session.delivery = null
    req.session.gst = null
    req.session.total = null
    req.session.addressIdaddressId = null
    req.session.addressId = null
    req.session.doorNums = null
    req.session.street = null
    req.session.district = null
    req.session.postcode = null
    req.session.city = null
    req.session.firstName = null
    req.session.lastName = null
    req.session.phone = null
    req.session.orderNotes = null
    req.session.email = null
    req.session.paymentMethod = null
    req.session.couponCode = null
    req.session.coupon = null

    return res.status(200).send({ success: true })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const confirmPage = async (req, res, next) => {
  try {
    if (req.session.orderId) {
      const userEmail = req.session.user.email
      const userVer = await usercollection.findOne({ email: userEmail })
      const name = userVer.name
      const orderId = req.session.orderId
      return res.render('user/confirmOrder', { userVer, name, orderId })
    } else {
      return res.redirect('/shop')
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const applyCoupon = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    const couponCheck = await coupon.findOne({ code: req.body.code })
    if (couponCheck) {
      const expiryDate = new Date(couponCheck.expiryDate)
      const today = new Date()
      const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
      if (expiryDate < todayDateOnly) {
        return res
          .status(208)
          .send({
            success: false,
            title: 'Coupon Expired',
            message: 'Coupon Expired!',
          })
      }
      for (let i = 0; i < couponCheck.usedBy.length; i++) {
        if (userVer._id.toString() == couponCheck.usedBy[i].toString()) {
          return res
            .status(208)
            .send({
              success: false,
              title: 'Already Used!',
              message: 'This coupon Already used by you!',
            })
        }
      }
      if (couponCheck.minPurchase) {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail })
        let cartItems = await cart.find({ userId: userVer._id }).populate({
          path: 'productId',
          select:
            'productName productPrice productOfferPrice productImage1 isListed productStock _id',
        })
        cartItems = cartItems.map((item) => {
          const productStock = item.productId?.productStock || 100 // Default stock if undefined
          item.productQuantity = Math.min(item.productQuantity, productStock) // Adjust quantity to stock
          return item
        })
        let total = 0
        for (let i = 0; i < cartItems.length; i++) {
          let t = 0
          if (cartItems[i].productId.productOfferPrice) {
            t = cartItems[i].productId.productOfferPrice
          } else {
            t = cartItems[i].productId.productPrice
          }
          total += t * cartItems[i].productQuantity
        }
        if (
          total * 1.18 + Number(req.session.billingMethode) <
          couponCheck.minPurchase
        ) {
          return res
            .status(208)
            .send({
              success: false,
              title: 'Coupon not Applied',
              message: `This Coupon applicable on transactions above ₹${couponCheck.minPurchase}!`,
            })
        }
      }
      req.session.couponCode = couponCheck.code
      req.session.coupon = couponCheck.percentage
      return res
        .status(200)
        .send({
          success: true,
          title: 'Coupon Applied',
          message: 'Coupon Applied Successfully!',
        })
    } else {
      return res
        .status(208)
        .send({
          success: false,
          title: 'Invalid Coupon!',
          message: `Coupon not Applied!`,
        })
    }
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const removeCoupon = async (req, res, next) => {
  try {
    req.session.couponCode = null
    req.session.coupon = null
    return res
      .status(200)
      .send({
        success: true,
        title: 'Coupon removed!',
        message: 'Coupon removed Successfully!',
      })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

const onlinePay = async (req, res, next) => {
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
    res.status(500).send('Error creating order')
  }
}

const verifyPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body
  const secret = process.env.KEY_SECRET
  const body = razorpay_order_id + '|' + razorpay_payment_id

  try {
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

const failPayment = async (req, res, next) => {
  try {
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail })
    let placedAddress = {}
    let priceDetail = {
      subTotal: req.body.subTotal,
      delivery: req.body.delivery,
      gst: req.body.gst,
      coupon: req.body.coupon ?? 0,
      total: req.body.total,
    }
    if (req.session.addressId) {
      const orderAddress = await address.findOne({ _id: req.session.addressId })
      placedAddress = {
        doorNo: orderAddress.doorNo,
        street: orderAddress.street,
        city: orderAddress.city,
        district: orderAddress.district,
        pinCode: orderAddress.pinCode,
      }
    } else {
      placedAddress = {
        doorNo: req.session.doorNums,
        street: req.session.street,
        city: req.session.city,
        district: req.session.district,
        pinCode: req.session.postcode,
      }
      const addressCount = await address.countDocuments({ userId: userVer._id })
      const newaddress = new address({
        userId: userVer._id,
        addressCount: addressCount + 1,
        doorNo: req.session.doorNums,
        street: req.session.street,
        city: req.session.city,
        district: req.session.district,
        pinCode: req.session.postcode,
      })
      newaddress.save()
    }

    let cartItems = await cart.find({ userId: userVer._id }).populate({
      path: 'productId',
      select:
        'productName productPrice productOfferPrice productImage1 productCategoryId isListed productStock _id',
    })

    cartItems = cartItems.filter((product => product.productId?.isListed))

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

    let productDetails = []
    let totalDiscountAmount = 0
    for (let i = 0; i < cartItems.length; i++) {
      let price = 0
      if (cartItems[i].productId?.productOfferPrice) {
        price = cartItems[i].productId.productOfferPrice
        totalDiscountAmount +=
          (cartItems[i].productId.productPrice -
            cartItems[i].productId.productOfferPrice) *
          cartItems[i].productQuantity
      } else {
        price = cartItems[i].productId.productPrice
      }
      let obj = {
        productName: cartItems[i].productId.productName,
        productPrice: price,
        quantity: cartItems[i].productQuantity,
        productId: cartItems[i].productId._id,
      }
      productDetails.push(obj)
    }

    totalDiscountAmount += req.body.coupon ?? 0
    priceDetail.totalDiscountAmount = totalDiscountAmount

    const orderId = generateOrderID()

    const orders = new order({
      userId: userVer._id,
      orderId: orderId,
      address: placedAddress,
      fullName: req.session.firstName + ' ' + req.session.lastName,
      phone: req.session.phone,
      email: req.session.email,
      paymentMethod: req.session.paymentMethod,
      orderNotes: req.session.orderNotes,
      totalDiscountAmount: totalDiscountAmount,
      priceDetails: priceDetail,
      products: productDetails,
      status: 'Payment Pending',
    })
    let newID = await orders.save()
    req.session.failPaymentId = newID._id
    return res.status(200).send({ success: true })
  } catch (error) {
    console.log(error)
    next(new AppError('Sorry...Something went wrong', 500))
  }
}

module.exports = {
  checkoutPageOne,
  checkoutTwoPost,
  billingPage,
  billingMethodPost,
  paymentPage,
  paymentMethod,
  finalReview,
  finalQuantityCheck,
  orderPost,
  confirmPage,
  applyCoupon,
  removeCoupon,
  onlinePay,
  verifyPayment,
  failPayment,
}
