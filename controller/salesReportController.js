const path = require('path');
const order = require("../model/orders");
const AppError = require("../middleware/errorHandling")
const generatePDFService = require('../services/pdfService');
const generateExcelService = require('../services/xlsxService')

const salesReportPage = async(req,res,next)=>{
    try {
        const start = req.session.startDate
        const end = req.session.endDate
        let timePeriod = req.session.timePeriod
        if(!timePeriod) timePeriod = null
        let totalAmount = 0
        let discount = 0
        if(start || end){
            const orders = await order.find({status:"Delivered",deliveryDate:{
                $gte: start,
                $lte: end
            }}).sort({ deliveryDate: -1 })
            for(let i=0;i<orders.length;i++){
                totalAmount += orders[i].priceDetails.total
                discount += orders[i].priceDetails.totalDiscountAmount
            }
            totalAmount = Math.floor(totalAmount)
            discount = Math.floor(discount)
            return res.render("admin/salesReport",{orders,start,end,timePeriod,totalAmount,discount})
        }
        else if(timePeriod){
            const today = new Date();
            if(timePeriod == 'week'){
                const lastWeek = new Date();
                lastWeek.setDate(today.getDate() - 7);
                const orders = await order.find({status:"Delivered",deliveryDate:{
                    $gte: lastWeek,
                    $lte: today
                }})
                for(let i=0;i<orders.length;i++){
                    totalAmount += orders[i].priceDetails.total
                    discount += orders[i].priceDetails.totalDiscountAmount
                }
                totalAmount = Math.floor(totalAmount)
                discount = Math.floor(discount)
                return res.render("admin/salesReport",{orders,start,end,timePeriod,totalAmount,discount})
            } else if(timePeriod == 'month'){
                const lastMonth = new Date();
                lastMonth.setMonth(today.getMonth() - 1);
                const orders = await order.find({status:"Delivered",deliveryDate:{
                    $gte: lastMonth,
                    $lte: today
                }}).sort({ deliveryDate: 1 })
                for(let i=0;i<orders.length;i++){
                    totalAmount += orders[i].priceDetails.total
                    discount += orders[i].priceDetails.totalDiscountAmount
                }
                totalAmount = Math.floor(totalAmount)
                discount = Math.floor(discount)
                return res.render("admin/salesReport",{orders,start,end,timePeriod,totalAmount,discount})
            } else if(timePeriod == 'year'){
                const lastYear = new Date();
                lastYear.setFullYear(today.getFullYear() - 1);
                const orders = await order.find({status:"Delivered",deliveryDate:{
                    $gte: lastYear,
                    $lte: today
                }}).sort({ deliveryDate: 1 })
                for(let i=0;i<orders.length;i++){
                    totalAmount += orders[i].priceDetails.total
                    discount += orders[i].priceDetails.totalDiscountAmount
                }
                totalAmount = Math.floor(totalAmount)
                discount = Math.floor(discount)
                return res.render("admin/salesReport",{orders,start,end,timePeriod,totalAmount,discount})
            }
        } else {
            const orders = await order.find({status:"Delivered"}).sort({ deliveryDate: -1 })
            for(let i=0;i<orders.length;i++){
                totalAmount += orders[i].priceDetails.total
                discount += orders[i].priceDetails.totalDiscountAmount
            }
            totalAmount = Math.floor(totalAmount)
            discount = Math.floor(discount)
            return res.render("admin/salesReport",{orders,start,end,timePeriod,totalAmount,discount})
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const filterByDate = async(req,res,next)=>{
    try {
        req.session.startDate = req.body.startDate
        req.session.endDate = req.body.endDate
        req.session.timePeriod = null
        return res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const filterByTimePeriod = async(req,res,next)=>{
    try {
        req.session.startDate = null
        req.session.endDate = null
        req.session.timePeriod = req.body.timePeriod
        return res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const clearFilter = async(req,res,next)=>{
    try {
        req.session.startDate = null
        req.session.endDate = null
        req.session.timePeriod = null
        return res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const generatePDFpage = async(req,res,next)=>{
    try {
        let totalAmount = 0
        let discount = 0
        if(req.session.startDate){
            const start = req.session.startDate
            const end = req.session.endDate
            const orders = await order.find({status:"Delivered",deliveryDate:{
                $gte: start,
                $lte: end
            }}).sort({ deliveryDate: -1 })
            for(let i=0;i<orders.length;i++){
                let tem = 0
                for(let j=0;j<orders[i].products.length;j++)tem++
                orders.productsCount = tem
                orders[i].sno = i+1
                totalAmount += orders[i].priceDetails.total
                discount += orders[i].priceDetails.totalDiscountAmount
            }
            totalAmount = Math.floor(totalAmount)
            discount = Math.floor(discount)
            const pdfPath = await generatePDFService.generatePDF(orders, totalAmount, discount, start, end);
            res.download(pdfPath, 'Sales_Report.pdf', (err) => {
                if (err) console.log(err);
            });
        }
        else if(req.session.timePeriod){
            const timePeriod = req.session.timePeriod
            const today = new Date();
            if(timePeriod == 'week'){
                const lastWeek = new Date();
                lastWeek.setDate(today.getDate() - 7);
                const orders = await order.find({status:"Delivered",deliveryDate:{
                    $gte: lastWeek,
                    $lte: today
                }})
                for(let i=0;i<orders.length;i++){
                    let tem = 0
                    for(let j=0;j<orders[i].products.length;j++)tem++
                    orders.productsCount = tem
                    orders[i].sno = i+1
                    totalAmount += orders[i].priceDetails.total
                    discount += orders[i].priceDetails.totalDiscountAmount
                }
                totalAmount = Math.floor(totalAmount)
                discount = Math.floor(discount)
                const pdfPath = await generatePDFService.generatePDF(orders, totalAmount, discount, lastWeek, today);
                res.download(pdfPath, 'Sales_Report.pdf', (err) => {
                    if (err) console.log(err);
                });
            } else if(timePeriod == 'month'){
                const lastMonth = new Date();
                lastMonth.setMonth(today.getMonth() - 1);
                const orders = await order.find({status:"Delivered",deliveryDate:{
                    $gte: lastMonth,
                    $lte: today
                }}).sort({ deliveryDate: 1 })
                for(let i=0;i<orders.length;i++){
                    let tem = 0
                    for(let j=0;j<orders[i].products.length;j++)tem++
                    orders.productsCount = tem
                    orders[i].sno = i+1
                    totalAmount += orders[i].priceDetails.total
                    discount += orders[i].priceDetails.totalDiscountAmount
                }
                totalAmount = Math.floor(totalAmount)
                discount = Math.floor(discount)
                const pdfPath = await generatePDFService.generatePDF(orders, totalAmount, discount, lastMonth, today);
                res.download(pdfPath, 'Sales_Report.pdf', (err) => {
                    if (err) console.log(err);
                });
            } else if(timePeriod == 'year'){
                const lastYear = new Date();
                lastYear.setFullYear(today.getFullYear() - 1);
                const orders = await order.find({status:"Delivered",deliveryDate:{
                    $gte: lastYear,
                    $lte: today
                }}).sort({ deliveryDate: 1 })
                for(let i=0;i<orders.length;i++){
                    let tem = 0
                    for(let j=0;j<orders[i].products.length;j++)tem++
                    orders.productsCount = tem
                    orders[i].sno = i+1
                    totalAmount += orders[i].priceDetails.total
                    discount += orders[i].priceDetails.totalDiscountAmount
                }
                totalAmount = Math.floor(totalAmount)
                discount = Math.floor(discount)
                const pdfPath = await generatePDFService.generatePDF(orders, totalAmount, discount, lastYear, today);
                res.download(pdfPath, 'Sales_Report.pdf', (err) => {
                    if (err) console.log(err);
                });
            }
        } else {
            const orders = await order.find({status:"Delivered"}).sort({ deliveryDate: -1 })
            for(let i=0;i<orders.length;i++){
                let tem = 0
                for(let j=0;j<orders[i].products.length;j++)tem++
                orders.productsCount = tem
                orders[i].sno = i+1
                totalAmount += orders[i].priceDetails.total
                discount += orders[i].priceDetails.totalDiscountAmount
            }
            totalAmount = Math.floor(totalAmount)
            discount = Math.floor(discount)
            const pdfPath = await generatePDFService.generatePDF(orders, totalAmount, discount);
            res.download(pdfPath, 'Sales_Report.pdf', (err) => {
                if (err) console.log(err);
            });
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const generateExcel = async(req,res,next)=>{
    try {
        let totalAmount = 0
        let discount = 0
        if(req.session.startDate){
            const start = req.session.startDate
            const end = req.session.endDate
            const orders = await order.find({status:"Delivered",deliveryDate:{
                $gte: start,
                $lte: end
            }}).sort({ deliveryDate: -1 })
            for(let i=0;i<orders.length;i++){
                let tem = 0
                for(let j=0;j<orders[i].products.length;j++)tem++
                orders.productsCount = tem
                orders[i].sno = i+1
                totalAmount += orders[i].priceDetails.total
                discount += orders[i].priceDetails.totalDiscountAmount
            }
            totalAmount = Math.floor(totalAmount)
            discount = Math.floor(discount)
            const excelPath = await generateExcelService.generateExcel(orders, totalAmount, discount, start, end);
            res.download(excelPath, 'Sales_Report.xlsx', (err) => {
                if (err) console.log(err);
            });
        }
        else if(req.session.timePeriod){
            const timePeriod = req.session.timePeriod
            const today = new Date();
            if(timePeriod == 'week'){
                const lastWeek = new Date();
                lastWeek.setDate(today.getDate() - 7);
                const orders = await order.find({status:"Delivered",deliveryDate:{
                    $gte: lastWeek,
                    $lte: today
                }})
                for(let i=0;i<orders.length;i++){
                    let tem = 0
                    for(let j=0;j<orders[i].products.length;j++)tem++
                    orders.productsCount = tem
                    orders[i].sno = i+1
                    totalAmount += orders[i].priceDetails.total
                    discount += orders[i].priceDetails.totalDiscountAmount
                }
                totalAmount = Math.floor(totalAmount)
                discount = Math.floor(discount)
                const excelPath = await generateExcelService.generateExcel(orders, totalAmount, discount, lastWeek, today);
                res.download(excelPath, 'Sales_Report.xlsx', (err) => {
                    if (err) console.log(err);
                });
            } else if(timePeriod == 'month'){
                const lastMonth = new Date();
                lastMonth.setMonth(today.getMonth() - 1);
                const orders = await order.find({status:"Delivered",deliveryDate:{
                    $gte: lastMonth,
                    $lte: today
                }}).sort({ deliveryDate: 1 })
                for(let i=0;i<orders.length;i++){
                    let tem = 0
                    for(let j=0;j<orders[i].products.length;j++)tem++
                    orders.productsCount = tem
                    orders[i].sno = i+1
                    totalAmount += orders[i].priceDetails.total
                    discount += orders[i].priceDetails.totalDiscountAmount
                }
                totalAmount = Math.floor(totalAmount)
                discount = Math.floor(discount)
                const excelPath = await generateExcelService.generateExcel(orders, totalAmount, discount, lastMonth, today);
                res.download(excelPath, 'Sales_Report.xlsx', (err) => {
                    if (err) console.log(err);
                });
            } else if(timePeriod == 'year'){
                const lastYear = new Date();
                lastYear.setFullYear(today.getFullYear() - 1);
                const orders = await order.find({status:"Delivered",deliveryDate:{
                    $gte: lastYear,
                    $lte: today
                }}).sort({ deliveryDate: 1 })
                for(let i=0;i<orders.length;i++){
                    let tem = 0
                    for(let j=0;j<orders[i].products.length;j++)tem++
                    orders.productsCount = tem
                    orders[i].sno = i+1
                    totalAmount += orders[i].priceDetails.total
                    discount += orders[i].priceDetails.totalDiscountAmount
                }
                totalAmount = Math.floor(totalAmount)
                discount = Math.floor(discount)
                const excelPath = await generateExcelService.generateExcel(orders, totalAmount, discount, lastYear, today);
                res.download(excelPath, 'Sales_Report.xlsx', (err) => {
                    if (err) console.log(err);
                });
            }
        } else {
            const orders = await order.find({status:"Delivered"}).sort({ deliveryDate: -1 })
            for(let i=0;i<orders.length;i++){
                let tem = 0
                for(let j=0;j<orders[i].products.length;j++)tem++
                orders.productsCount = tem
                orders[i].sno = i+1
                totalAmount += orders[i].priceDetails.total
                discount += orders[i].priceDetails.totalDiscountAmount
            }
            totalAmount = Math.floor(totalAmount)
            discount = Math.floor(discount)
            const excelPath = await generateExcelService.generateExcel(orders, totalAmount, discount);
            res.download(excelPath, 'Sales_Report.xlsx', (err) => {
                if (err) console.log(err);
            });
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

module.exports = {salesReportPage,filterByDate,filterByTimePeriod,clearFilter,generatePDFpage,generateExcel}