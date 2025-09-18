const userModel = require("../model/user");
const bcrypt = require('bcrypt');
const cloudinary = require('../config/cloudinary')
const fs = require('fs');

exports.register = async (req, res) => {
    try {
        const {fullName, email, age, password, phoneNumber} = req.body
        const file = req.file;
        let response;
        const existingEmail = await userModel.findOne({email: email.toLowerCase()});
        const existingPhoneNumber = await userModel.findOne({phoneNumber: phoneNumber});
        
        if(existingEmail || existingPhoneNumber) {
             fs.unlinkSync(file.path)
            return res.status(400).json({
                messasge: 'User already exists'
            })
        }
        if (file && file.path) {
           response = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path)
            }
        
        const saltRound = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, saltRound);

        const user = new userModel({
            fullName,
            email,
            password: hashPassword,
            age,
            phoneNumber,
            profiePicture: {
                publicId: response.public_id,
                imageUrl: response.secure_url
            }
        });
        await user.save()
        res.status(201).json({
            message: "User created successfully",
            data: user
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
};


exports.getoneUser = async (req, res) => {
    try {
       const userId = req.params.id;
        const user = await userModel.findById(userId);
        if(!user) {
            return res.status(404).json({       
                message: 'User not found'
            });
        }
        res.status(200).json({
            message: 'User retrieved successfully',
            data: user
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const {fullName, age} = req.body;
        const{id} = req.params;
        const file = req.file;
        let response;
        const user = await userModel.findById(id);

        if(!user){
            return res.status(404).json('User not found');
        };

        if (file && file.path) {
            await cloudinary.uploader.upload(file.path)
            fs.unlinkSync(file.path)
        }
        const userData = {
            fullName: fullName ?? user.fullName,
            age: age ?? user.age,
            profiePicture: {
                imageUrl: response?.secure_url,
                publicId: response?.public_id
            }
        };
        const newData = Object.assign(user, userData);
        const update = await userModel.findByIdAndUpdate(user._id, newData, {new: true});
        res.status(200).json({
            message: 'User updated successfully',
            data: update
        })
    } catch (error) {
     res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });   
    }
}