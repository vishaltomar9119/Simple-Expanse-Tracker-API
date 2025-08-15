const jwt = require('jsonwebtoken');
const { User } = require('../models/model');

const secretKey = process.env.JWT_SECRET || "jvnfhu234xfr56";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.is_deleted) {
      return res.status(401).json({ error: 'Unauthorized: User not found or deleted' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
