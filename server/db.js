import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DB_PATH = path.join(__dirname, 'database.json');

// Initial Mock data for fallback storage
const INITIAL_DATA = {
  resumes: [],
  analytics: {
    streak: 5,
    rank: 142,
    xp: 2850,
    solvedCount: 42,
    totalBattles: 18,
    battlesWon: 12,
    accuracy: 88,
    speed: 74,
    dailySubmissions: [
      { date: '2026-05-20', count: 2 },
      { date: '2026-05-21', count: 5 },
      { date: '2026-05-22', count: 3 },
      { date: '2026-05-23', count: 8 },
      { date: '2026-05-24', count: 1 },
      { date: '2026-05-25', count: 4 },
      { date: '2026-05-26', count: 6 }
    ]
  },
  interviews: [],
  enrollments: [],
  jobApplications: [],
  mockTests: []
};

// Ensure local file exists if fallback is used
if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(INITIAL_DATA, null, 2));
}

let isUsingMongoDB = false;

// Connect to MongoDB
async function tryConnect(mongoUri, attempt) {
  try {
    console.log(`Connecting to MongoDB at ${mongoUri} (attempt ${attempt})...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 5000
    });
    return true;
  } catch (err) {
    console.warn(`MongoDB connect attempt ${attempt} failed: ${err.message}`);
    return false;
  }
}

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shamutha';
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const ok = await tryConnect(mongoUri, attempt);
    if (ok) {
      isUsingMongoDB = true;
      console.log('✅ MongoDB connected successfully.');
      return;
    }
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.warn('⚠️ MongoDB connection failed after multiple attempts. Falling back to local JSON database storage.');
  isUsingMongoDB = false;
}

// Defining MongoDB Schemas if connected
const resumeSchema = new mongoose.Schema({
  userId: String,
  fullName: String,
  email: String,
  phone: String,
  education: String,
  experience: String,
  skills: [String],
  template: String,
  updatedAt: { type: Date, default: Date.now }
});

const interviewSchema = new mongoose.Schema({
  userName: String,
  role: String,
  score: Number,
  duration: Number,
  feedback: String,
  transcript: [{ speaker: String, text: String }],
  cheatingScore: Number,
  warnings: [String],
  createdAt: { type: Date, default: Date.now }
});

const ResumeModel = mongoose.model('Resume', resumeSchema);
const InterviewModel = mongoose.model('Interview', interviewSchema);

const mockTestSchema = new mongoose.Schema({
  userName: String,
  topic: String,
  difficulty: String,
  score: Number,
  duration: Number,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    userAnswer: Number,
    explanation: String
  }],
  strengths: [String],
  weaknesses: [String],
  createdAt: { type: Date, default: Date.now }
});

const MockTestModel = mongoose.model('MockTest', mockTestSchema);

// Reading & Writing helper functions for JSON File Fallback
function readLocalDB() {
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local DB:', err);
    return INITIAL_DATA;
  }
}

function writeLocalDB(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local DB:', err);
  }
}

// DATABASE INTERFACE METHODS (handles Mongo or Fallback dynamically)
export async function saveResume(resumeData) {
  if (isUsingMongoDB) {
    try {
      return await ResumeModel.findOneAndUpdate(
        { email: resumeData.email },
        resumeData,
        { upsert: true, new: true }
      );
    } catch (e) {
      console.error('Mongo saveResume error, fallback to local', e);
    }
  }
  // Local File Storage
  const db = readLocalDB();
  const index = db.resumes.findIndex(r => r.email === resumeData.email);
  const updatedResume = { ...resumeData, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    db.resumes[index] = updatedResume;
  } else {
    db.resumes.push(updatedResume);
  }
  writeLocalDB(db);
  return updatedResume;
}

export async function getResume(email) {
  if (isUsingMongoDB) {
    try {
      return await ResumeModel.findOne({ email });
    } catch (e) {
      console.error('Mongo getResume error, fallback to local', e);
    }
  }
  const db = readLocalDB();
  return db.resumes.find(r => r.email === email) || null;
}

export async function saveInterviewResult(interviewData) {
  if (isUsingMongoDB) {
    try {
      const interview = new InterviewModel(interviewData);
      return await interview.save();
    } catch (e) {
      console.error('Mongo saveInterview error, fallback to local', e);
    }
  }
  const db = readLocalDB();
  const id = Date.now().toString(36);
  const record = { id, ...interviewData, createdAt: new Date().toISOString() };
  db.interviews.push(record);
  writeLocalDB(db);
  return record;
}

export async function getInterviews() {
  if (isUsingMongoDB) {
    try {
      return await InterviewModel.find().sort({ createdAt: -1 });
    } catch (e) {
      console.error('Mongo getInterviews error, fallback to local', e);
    }
  }
  const db = readLocalDB();
  return db.interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getAnalytics() {
  const db = readLocalDB();
  return db.analytics;
}

export async function saveAnalytics(analyticsData) {
  const db = readLocalDB();
  db.analytics = { ...db.analytics, ...analyticsData };
  writeLocalDB(db);
  return db.analytics;
}

export async function enrollInCourse(courseId) {
  const db = readLocalDB();
  if (!db.enrollments.includes(courseId)) {
    db.enrollments.push(courseId);
    writeLocalDB(db);
  }
  return db.enrollments;
}

export async function getEnrollments() {
  const db = readLocalDB();
  return db.enrollments;
}

export async function applyForJob(jobId, applicantName, email) {
  const db = readLocalDB();
  const application = {
    id: Date.now().toString(36),
    jobId,
    applicantName,
    email,
    appliedAt: new Date().toISOString(),
    status: 'Applied'
  };
  db.jobApplications.push(application);
  writeLocalDB(db);
  return application;
}

export async function getJobApplications() {
  const db = readLocalDB();
  return db.jobApplications;
}

export async function saveInterview(interviewData) {
  return saveInterviewResult(interviewData);
}

export async function incrementSolvedCount() {
  const current = await getAnalytics();
  return saveAnalytics({
    xp: current.xp + 100,
    solvedCount: current.solvedCount + 1
  });
}

export async function addXP(name, amount) {
  const current = await getAnalytics();
  return saveAnalytics({
    xp: current.xp + (amount || 0)
  });
}

export async function getLeaderboard() {
  return [];
}

export async function enrollCourse(courseId) {
  return enrollInCourse(courseId);
}

export async function saveJobApplication(applicationData) {
  return applyForJob(applicationData.jobId, applicationData.applicantName, applicationData.email);
}

export async function saveMockTestResult(testData) {
  if (isUsingMongoDB) {
    try {
      const mockTest = new MockTestModel(testData);
      return await mockTest.save();
    } catch (e) {
      console.error('Mongo saveMockTestResult error, fallback to local', e);
    }
  }
  const db = readLocalDB();
  const id = Date.now().toString(36);
  const record = { id, ...testData, createdAt: new Date().toISOString() };
  if (!db.mockTests) db.mockTests = [];
  db.mockTests.push(record);
  writeLocalDB(db);
  return record;
}

export async function getMockTestHistory() {
  if (isUsingMongoDB) {
    try {
      return await MockTestModel.find().sort({ createdAt: -1 });
    } catch (e) {
      console.error('Mongo getMockTestHistory error, fallback to local', e);
    }
  }
  const db = readLocalDB();
  if (!db.mockTests) db.mockTests = [];
  return db.mockTests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
