const productModel = require("../model/product");
const fs = require('fs');
const cloudinary = require('../config/cloudinary');


exports.products =  async (req, res) => {
    try {
        const {productName} = req.body;
        const files = req.files;
        let response;
        let listOfProducts = [];
        let product = {};

        if (files && files.length > 0) {
            for (const file of files) {
                response = await cloudinary.uploader.upload(file.path);
                product = {
                    publicId: response.public_id,
                    imageUrl: response.secure_url
                };
                listOfProducts.push(product);
                fs.unlinkSync(file.path)
            }
        };
        const products = await productModel.create({
            productName,
            productImages: listOfProducts
        })

        re.status(201).json({
            message: 'Products created successfully',
            data: products
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
};

exports.update = async (req, res) => {
    try {
        const {productName} = req.body;
        const {id} = req.params;
        const products = await productModel.findById(id);
        const files = req.files;
        
        if (!products) {
            return res.status(404).json('Product not found')
        };

        if (files && files.length > 0) {
            for (const product of products.productImages) {
                await cloudinary.uploader.destroy(product.publicId)
            }
            for (const file of files) {
                response = await cloudinary.uploader.upload(file.path)
                fs.unlinkSync(file.path)
            }
        };
        const data = {
            productName: productName ?? products.productName,
            productImages: {
                imageUrl: response?.secure_url,
                publicId: response?.public_id
            }
        };
        const newData = Object.assign(products, data);
        const update = await productModel.findByIdAndUpdate(products._id, newData, {new: true});
        res.status(200).json({
            message: "Product updated successfully",
            data: update
        })
    } catch (error) {
     console.log(error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })   
    }
}
