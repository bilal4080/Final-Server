
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    number: { type: String, required: false },
    email: { type: String, required: false },
    password: { type: String, required: true },
    status: { type: Boolean, default: true },
});

const CoinbdixUser = mongoose.model('COINBDIXUSER', userSchema);

module.exports = { CoinbdixUser };
