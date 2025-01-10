const product = require("../model/productModel")
const category = require("../model/categoryModel");
const path = require('path');
const fs = require('fs');

const productPage = async(req,res)=>{
    const products = await product.find({})
    console.log('pr ', products)
    return res.render("admin/product",{products})
}

const addProduct = async(req,res)=>{
    try{
        const categories = await category.find({})
        res.render("admin/addProduct",{categories})
    } catch (error) {
        console.log(error)
    }
}

const addProductPost = async (req, res) => {
    try {
        const { productName, productDescription, productPrice, productStock, productCategory } = req.body;

        if (!productName || !productDescription || !productPrice || !productStock || !productCategory) {
            return res.status(400).send('All fields are required.');
        }

        // Handle images (Multer automatically saves files to the 'uploads' directory)
        const images = req.files;
        const productImages = {};

        // Check for the presence of image files and store their paths
        if (images['productImage1']) {
            productImages.productImage1 = `/uploads/${images['productImage1'][0].filename}`;
        }
        if (images['productImage2']) {
            productImages.productImage2 = `/uploads/${images['productImage2'][0].filename}`;
        }
        if (images['productImage3']) {
            productImages.productImage3 = `/uploads/${images['productImage3'][0].filename}`;
        }

        // Create a new product document
        const newProduct = new product({
            productName,
            productDescription,
            productPrice,
            productStock, // Correct field name (was 'productStack' in your schema)
            productCategory,
            productImage1: productImages.productImage1 || '',
            productImage2: productImages.productImage2 || '',
            productImage3: productImages.productImage3 || '',
        });

        // Save the product to the database
        await newProduct.save();

        // Respond with success
        res.status(201).json({ message: 'Product added successfully!' });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const productEdit = async(req,res)=>{
    const id = req.params.id
    const products = await product.findById({_id: id})
    const categories = await category.find({})
    return res.render("admin/editProduct",{products,categories})
}

const unListProduct = async(req,res)=>{
    try {
        const productId = req.params.id;
        await product.updateOne({ _id:productId}, { isListed:false});
        res.json({ success: true, message: 'Product Unlisted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to list category.' });
    }
}

const listProduct = async(req,res)=>{
    try {
        const productId = req.params.id;
        await product.updateOne({ _id:productId}, { isListed:true});
        res.json({ success: true, message: 'Product Listed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to unlist category.' });
    }
}



module.exports = {productPage,addProduct,addProductPost,productEdit,unListProduct,listProduct}