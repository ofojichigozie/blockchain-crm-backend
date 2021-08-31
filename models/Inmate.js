const mongoose = require('mongoose');

const InmateSchema = mongoose.Schema({
    index: {
        type: Number,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    precedingHash: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    nonce: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Inmate', InmateSchema);