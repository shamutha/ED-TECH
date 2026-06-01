import mongoose from 'mongoose';
const { Schema } = mongoose;

const JobSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  type: { type: String, enum: ['Full-Time', 'Internship', 'Part-Time'], default: 'Full-Time' },
  requiredSkills: [String],
  postedBy: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true });

export default mongoose.model('Job', JobSchema);
