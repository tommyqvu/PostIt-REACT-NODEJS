const path = require('path');
const { validationResult } = require('express-validator/check');
const User = require('../models/user');
const Filter = require('bad-words');
const filter = new Filter();

exports.getStatus = (req,res,next)=>{
User.findById(req.userId)
.then(user=>{
  if(!user){
    const error = new Error("User not found")
    error.statusCode =  404
    throw error
  }
      return res.status(200).json({status: user.status})

})
.catch(err => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
})
}
exports.updateStatus = (req,res,next)=>{
const newStatus = req.body.status
const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Incorrect data');
    error.statusCode = 422;
    throw error;
  }
User.findById(req.userId)
.then(user=>{
  if(!user){
    const error = new Error("User not found")
    error.statusCode =  404
    throw error
  }
  user.status = filter.clean(newStatus)
  return user.save()
  .then(result=>{
    res.status(201).json({message: "Status updated"})
  })
})
.catch(err => {
  if (!err.statusCode) {
    err.statusCode = 500;
    err.message = errors.array()
  }
  next(err);
})
}

