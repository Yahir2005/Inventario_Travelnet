const config = require('./config.json');

const getSecret = () => process.env.JWT_SECRET || config.JWT_SECRET || '';

module.exports = { getSecret };
