const authController = {};
const { User } = require('../models/model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const secretKey = process.env.JWT_SECRET || "jvnfhu234xfr56";


const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id }, secretKey, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, secretKey, { expiresIn: '7d' });
};



const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if(!name|| !email ||!password){
         return res.send({status:false , message:"name , email , password are required fileds"})
        }
        const existingUser = await User.findOne({ email, is_deleted: false });
        if (existingUser) {
            return res.status(409).json({ status: false, error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = new User({ name, email, password: hashedPassword });

        const refreshToken = generateRefreshToken(newUser);
        newUser.refresh_token = refreshToken;

        await newUser.save();

        const accessToken = generateAccessToken(newUser);

        res.status(201).json({
            status: true,
            message: "User Registered",
            access_token: accessToken,
            refresh_token: refreshToken
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: false, error: 'Invalid registration data' });
    }
};




const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, is_deleted: false });
        if (!user) {
            return res.status(401).json({ status: false, error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: false, error: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

   
        user.refresh_token = refreshToken;
        await user.save();

        res.json({
            status: true,
            access_token: accessToken,
            refresh_token: refreshToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, error: 'Server error' });
    }
};



const refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ status: false, error: 'Refresh token required' });
    }

    try {
        
        const decoded = jwt.verify(token, secretKey);

        const user = await User.findById(decoded.id);
        if (!user || user.refresh_token !== token) {
            return res.status(403).json({ status: false, error: 'Invalid refresh token' });
        }


        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refresh_token = newRefreshToken;
        await user.save();

        res.json({
            status: true,
            message: 'Token refreshed',
            token:newAccessToken,
            refresh_token: newRefreshToken
        });

    } catch (err) {
        console.error("Refresh token verification failed:", err.message);
        res.status(403).json({ status: false, error: 'Token verification failed' });
    }
};


authController.register = register;
authController.login = login;
authController.refreshToken = refreshToken;

module.exports = authController;
