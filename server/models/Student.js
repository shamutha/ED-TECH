import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * User base schema is assumed to exist elsewhere (e.g., auth user collection).
 * Here we define Student extending user via a reference.
 */
const StudentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: Date,
  profilePic: String,
  skills: [{ name: String, level: { type: Number, min: 1, max: 5 } }],
  resumeUrl: String,
}, { timestamps: true });

export default mongoose.model('Student', StudentSchema);
