const getDbPool = require('../config/database');

const dbSelector = (req,res,next) => {
    const userRole = req.user ? req.user.Ocupacion : null;

    req.db = getDbPool(userRole);
    next();
};

module.exports = dbSelector;