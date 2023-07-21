const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');


const JWT_SECRET = 'Check'
//Route 1: Creating a User using : POST "api/auth/createuse",Doesn't require login
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be of minimum 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    //checking for errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success,errors: errors.array() })
    }
    try {
        // Checking if user with same email exists or not.
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success,error: "Sorry this email already exists." })
        }
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt)
        //User Creation
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        // res.json(user)
        let success = true;
        res.json({ success,authToken })
        console.log({success,authToken});

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some error occured")
    }
})
//Route 2: Login Authentication using : POST "api/auth/login",Doesn't require login
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password cannot be left empty').exists(),
], async (req, res) => {
    //Compling the request and checking for errrors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body
    try {
        //Checking if email is in DataBase
        let user = await User.findOne({ email })
        if (!user) {
            let success = false
            return res.status(400).json({ success, errors: 'Please Enter the correct Credentials' })

        }
        //Comparing the password given in input with the hash present in DataBase.(Return Boolean)
        const Compare = await bcrypt.compare(password, user.password);
        if (!Compare) {
            let success = false
            return res.status(400).json({ success, errors: 'Please Enter the correct Credentials' })
        }
        //Only userid will be given as data 
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        // res.json(user)
        let success = true;
        res.json({ success,authToken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})
//Route 3: Get loggedin User Details using : POST "api/auth/getuser",login required.
router.post('/getuser', fetchuser,  async (req, res) => {

    try {
      let userId = req.user.id;
      const user = await User.findById(userId).select("-password")
      res.send(user)
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })
  module.exports = router