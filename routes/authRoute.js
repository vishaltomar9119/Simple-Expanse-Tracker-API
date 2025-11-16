const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refreshToken', authController.refreshToken);
router.get('/check',async(req , res)=>{
    try{
        const {User} = require('../models/model');
        const data = await User.find({is_deleted:false})
        res.status(200).json(data);

    }catch(err){
       console.log(err);
       res.send(err)
    }
})

module.exports = router;
