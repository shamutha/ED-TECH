import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ApplicationSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  applicantName: { type: String, required: true },
  email: { type: String, required: true },
  resumeUrl: { type: String }, // optional link to uploaded resume
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview', 'selected', 'rejected'],
    default: 'applied'
  },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ApplicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default model('Application', ApplicationSchema);
