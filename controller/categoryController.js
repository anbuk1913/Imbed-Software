const category = require("../model/categoryModel");

const categoryPage = async(req,res)=>{
    const categories = await category.find({})
    return res.render("admin/category",{categories})
}

const addCategory = async(req,res)=>{
    try {
        const newCategory = new category({
            categoryName: req.body.categoryName,
            categoryDescription: req.body.categoryDescription
        });

        const categoryCheck = await category.findOne({categoryName:{$regex: new RegExp('^'+req.body.categoryName +'$','i') }});

        if (categoryCheck) {
            return res.status(208).send({ categoryExists: true })
        } else {
            newCategory.save();
            return res.status(200).send({ success: true })
        }
    } catch (error) {
        console.log(error);
    }
}

const listCategory = async(req,res)=>{
    try {
        const categoryId = req.params.id;
        await category.findByIdAndUpdate(categoryId, { isListed: true });
        res.json({ success: true, message: 'Category listed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to list category.' });
    }
}

const unListCategory = async(req,res)=>{
    try {
        const categoryId = req.params.id;
        await category.findByIdAndUpdate(categoryId, { isListed: false });
        res.json({ success: true, message: 'Category unlisted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to unlist category.' });
    }
}

module.exports = {categoryPage, addCategory, listCategory, unListCategory}