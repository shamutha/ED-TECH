import mongoose from 'mongoose';
const { Schema } = mongoose;

const CompanySchema = new Schema({
  name: { type: String, required: true },
  logoUrl: String,
  description: String,
  hrContact: {
    name: String,
    email: String,
    phone: String,
  },
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
}, { timestamps: true });

export default mongoose.model('Company', CompanySchema);
