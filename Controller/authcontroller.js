const bycrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {validationResult} = require("express-validator");
const User = require("../Models/user");

const registerUser = async (req, res) => {
    try {
      // Log the incoming request body for debugging
      console.log(req.body);
      
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ msg: "Invalid input", errors: errors.array() });
      }
  
      const { usernameoremail, password } = req.body;
  
      // Validate that all fields are provided
      if (!usernameoremail || !password) {
        return res.status(400).json({ msg: "All fields are required" });
      }
  
      // Check if the user already exists
      const existingUser = await User.findOne({ usernameoremail });
      if (existingUser) {
        return res.status(409).json({ msg: "User already exists" }); // Use 409 Conflict for better clarity
      }
  
      // Hash the password before saving it to the database
  
      // Create and save the new user
      const newUser = new User({
        usernameoremail,
        password
      });
  
      await newUser.save();
  
      // Create the payload and sign the JWT token
      const payload = { user: { id: newUser.usernameoremail } };
      const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "1h" });
  
      // Respond with the token
      res.status(201).json({ token, newUser }); // Use 201 Created status code
  
    } catch (err) {
      console.error("Server error:", err.message);
      res.status(500).json({ msg: "Server error" });
    }
  };
  
  

const loginUser = async( req, res)=>{
    const errors = validationResult(req);
    console.log(req.body);
    
    if(!errors.isEmpty()){
        return res.status(400).json({msg:"Invalid input",errors:errors.array()});
    }
    const {usernameoremail, password} = req.body;
    try{
        const user = await User.findOne({usernameoremail});
        if(!user){
            return res.status(401).json({msg:"Invalid Credentails"});
        }
        const isMatch = await bycrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({msg:"Invalid Credentials"});
        }
        const payload = {user:{id:user.usernameoremail}};
        const token = jwt.sign(payload, process.env.JWT_KEY, {expiresIn:"1h"});
        res.status(200).json({token, user})
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("Server error");
    }
}
const getAlluser = async(req,res)=>{
    try{
        const response = await User.find()
        if(response){
            return res.status(200).json(response);
        }
        else if(!response){
            return res.status(404).json({msg:"No user found"});
        }
    }
    catch(err){
        console.log(err.message);
    }
    
}

module.exports = {
    registerUser,
    loginUser,
    getAlluser
}