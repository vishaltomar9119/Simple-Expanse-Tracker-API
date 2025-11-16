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
        let val =0;
        for(var i=0 ;i<=20;i++){
            val = val+(i*i)
        }
        res.status(200).json({data:data, value:val, message:`message from server : ${process.env.CONTAINER_ID}`});

    }catch(err){
       console.log(err);
       res.send(err)
    }
})

module.exports = router;
