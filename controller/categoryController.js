const category = require("../model/categoryModel");

const categoryPage = async(req,res)=>{
    const categories = await category.find({})
    return res.render("admin/category",{categories})
}

const addCategory = async(req,res)=>{
    try {
        const categoryCheck = await category.findOne({categoryName:{$regex: new RegExp('^'+req.body.categoryName +'$','i') }});
        if (categoryCheck) {
            return res.status(208).send({ categoryExists: true })
        } else {
            const newCategory = new category({
                categoryName: req.body.categoryName,
                categoryDescription: req.body.categoryDescription
            });
            newCategory.save();
            return res.status(200).send({ success: true })
        }
    } catch (error) {
        console.log(error);
    }
}

const unListCategory = async(req,res)=>{
    try {
        const categoryId = req.params.id;
        await category.updateOne({ _id:categoryId}, { isListed:false});
        res.json({ success: true, message: 'Category Unlisted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to list category.' });
    }
}

const listCategory = async(req,res)=>{
    try {
        const categoryId = req.params.id;
        await category.updateOne({ _id:categoryId}, { isListed:true});
        res.json({ success: true, message: 'Category Listed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to unlist category.' });
    }
}

const editCategory = async(req,res)=>{
    try{
    const editedCategory = {
            _id : req.body.id,
            categoryName: req.body.name,
            categoryDescription : req.body.description
        }
        await category.updateOne({ _id:editedCategory._id}, { categoryName:editedCategory.categoryName, categoryDescription:editedCategory.categoryDescription})
        res.redirect("/admin/category")
    } catch(error) {
        console.log(error)
    }
}

module.exports = {categoryPage, addCategory, listCategory, unListCategory, editCategory}