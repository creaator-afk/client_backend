const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filePath: String,
    originalName: String,
    uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);