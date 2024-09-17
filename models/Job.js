const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    clientId: { type: String, required: true },
    clientName: { type: String, required: true },
    contactInfo: { type: String, required: true },
    receivedDate: { type: Date, default: Date.now },
    inventory: { type: String, required: true },
    reportedIssues: { type: String, required: true },
    clientNotes: { type: String, required: true },
    assignedTechnician: { type: String, required: true },
    estimatedAmount: { type: Number, required: true },
    deadline: { type: Date },
    status: { type: String, required: true }
});

module.exports = mongoose.model('Job', jobSchema);