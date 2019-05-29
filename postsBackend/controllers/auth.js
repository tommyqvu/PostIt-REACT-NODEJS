const User = require("../models/user")
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
exports.signup = (req,res,next)=>{
  const email = req.body.email
  const password = req.body.password
  const name = req.body.name
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    const error = new Error('Incorrect data');
    error.statusCode = 422;
    
    throw error;
  }
  bcrypt.hash(password, 12)
  .then(hashedPass =>{
    const user = new User ({
      email,
      password: hashedPass,
      name
    })

    return user.save()
  })
  .then(result=>{
    res.status(201).json({message:"User created", userId: result._id})
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
  
}

exports.login=(req,res,next)=>{
  const email = req.body.email
  const password = req.body.password 
  let loadedUser 
  User.findOne({email})
  .then(user=>{
    if(!user){
      const error = new Error("User with this email can not be found")
      error.statusCode =  401
      throw error
    }
    loadedUser = user
    return bcrypt.compare(password, user.password)
  })
  .then(isEqual=>{
    if(!isEqual){
      const error = new Error("Wrong password")
      error.statusCode = 401
      throw error
    }
    const token = jwt.sign({
      email:loadedUser.email,
      userId: loadedUser._id.toString()
    }, process.env.SECRET_KEY,
    {expiresIn: "1h"})
    res.status(201).json({token, userId: loadedUser._id.toString()})
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}