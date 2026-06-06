const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Reported', 'Cleaned'], default: 'Reported' },
  cleaner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // New field to store the proof photo
  cleanedImageUrl: { type: String } 
}, { timestamps: true });

// Index for map queries
reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);