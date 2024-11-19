const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    doc_id:{type: String, required: false},
    Amount: {type: String, required: false }

});

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = { Wallet };
