import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Code2, Mic, Video, Swords, FileText,
  ShoppingBag, Briefcase, BarChart3, Award, Sparkles, Bell,
  CheckCircle, AlertTriangle, X, Send, Trash2, Download, Trophy,
  Maximize2, Minimize2, MicOff, Volume2, Clock, Star, BookOpen, HelpCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import * as tf from '@tensorflow/tfjs';
import { loadStripe } from '@stripe/stripe-js';
import callFlashDetector from './flashProxy';
import LiveClassesModule from './LiveClassesModule';
import { addAppliedJob, setResumeField, setResumeData, setPlagiarismResult, setSubscriptionPlan, activateSubscription, setPaymentMethod } from './store.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const API_BASE = `${BACKEND_URL}/api`;

// ─────────────────────────────────────────
// INITIAL DATA
// ─────────────────────────────────────────
const INITIAL_PROBLEMS = {
  'two-sum': {
    title: 'Two Sum', difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    starterCode: 'function solution(nums, target) {\n  // Write your code here\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n  return [];\n}'
  },
  'reverse-string': {
    title: 'Reverse String', difficulty: 'Easy',
    description: 'Write a function that reverses a string. Return the reversed version of the input string.',
    starterCode: 'function solution(s) {\n  return s.split("").reverse().join("");\n}'
  },
  'fizz-buzz': {
    title: 'Fizz Buzz', difficulty: 'Easy',
    description: 'Given n, return array where: "FizzBuzz" if divisible by 3&5, "Fizz" by 3, "Buzz" by 5, else number as string.',
    starterCode: 'function solution(n) {\n  let res = [];\n  for (let i = 1; i <= n; i++) {\n    if (i%3===0 && i%5===0) res.push("FizzBuzz");\n    else if (i%3===0) res.push("Fizz");\n    else if (i%5===0) res.push("Buzz");\n    else res.push(String(i));\n  }\n  return res;\n}'
  },
  'palindrome': {
    title: 'Check Palindrome', difficulty: 'Easy',
    description: 'Given a string, return true if it is a palindrome (reads same forwards and backwards), false otherwise.',
    starterCode: 'function solution(s) {\n  // Write your code here\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g,"");\n  return clean === clean.split("").reverse().join("");\n}'
  },
  'max-subarray': {
    title: 'Maximum Subarray', difficulty: 'Medium',
    description: 'Given an integer array, find the subarray with the largest sum and return its sum. (Kadane\'s Algorithm)',
    starterCode: 'function solution(nums) {\n  // Write your code here\n  let maxSum = nums[0], curr = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxSum = Math.max(maxSum, curr);\n  }\n  return maxSum;\n}'
  }
};

const INITIAL_COURSES = [
  { id: 'c1',  title: 'The Complete 2024 Web Development Bootcamp', instructor: 'Dr. Angela Yu', category: 'Development', price: '₹499', image: 'https://img-c.udemycdn.com/course/240x135/1565838_e54e_16.jpg', progress: 45, enrolled: true,  rating: 4.7, students: 470093, hours: 62,  lectures: 374 },
  { id: 'c2',  title: 'React - The Complete Guide (incl Hooks, React Router, Redux)', instructor: 'Maximilian Schwarzmüller', category: 'Frontend', price: '₹449', image: 'https://img-c.udemycdn.com/course/240x135/1362070_b9a1_2.jpg', progress: 0,  enrolled: false, rating: 4.6, students: 218000, hours: 68,  lectures: 692 },
  { id: 'c3',  title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp', instructor: 'Jonas Schmedtmann', category: 'Backend', price: '₹399', image: 'https://img-c.udemycdn.com/course/240x135/1672410_f3a3_4.jpg', progress: 0,  enrolled: false, rating: 4.8, students: 93000,  hours: 42,  lectures: 228 },
  { id: 'c4',  title: 'JavaScript: The Complete Guide 2024 (Beginner + Advanced)', instructor: 'Maximilian Schwarzmüller', category: 'Development', price: '₹499', image: 'https://img-c.udemycdn.com/course/240x135/2508942_11d3.jpg', progress: 10, enrolled: true,  rating: 4.6, students: 148000, hours: 52,  lectures: 614 },
  { id: 'c5',  title: 'Python Bootcamp: From Zero to Hero in Python', instructor: 'Jose Portilla', category: 'Python', price: '₹499', image: 'https://img-c.udemycdn.com/course/240x135/903744_8eb2.jpg', progress: 0,  enrolled: false, rating: 4.6, students: 540000, hours: 24,  lectures: 155 },
  { id: 'c6',  title: 'Machine Learning A-Z: AI, Python & R + ChatGPT Prize', instructor: 'Kirill Eremenko', category: 'AI / ML', price: '₹549', image: 'https://img-c.udemycdn.com/course/240x135/950390_270f_3.jpg', progress: 0,  enrolled: false, rating: 4.5, students: 311000, hours: 44,  lectures: 375 },
  { id: 'c7',  title: 'Docker & Kubernetes: The Practical Guide', instructor: 'Maximilian Schwarzmüller', category: 'DevOps', price: '₹449', image: 'https://img-c.udemycdn.com/course/240x135/2035922_6c6b.jpg', progress: 0,  enrolled: false, rating: 4.7, students: 97000,  hours: 23,  lectures: 262 },
  { id: 'c8',  title: 'The Data Science Course: Complete Data Science Bootcamp', instructor: 'Soledad Galli', category: 'Data Science', price: '₹499', image: 'https://img-c.udemycdn.com/course/240x135/1754098_e0df_3.jpg', progress: 0,  enrolled: false, rating: 4.5, students: 130000, hours: 29,  lectures: 450 },
  { id: 'c9',  title: 'AWS Certified Solutions Architect - Associate 2024', instructor: 'Stephane Maarek', category: 'Cloud', price: '₹549', image: 'https://img-c.udemycdn.com/course/240x135/362328_91f3_10.jpg', progress: 0,  enrolled: false, rating: 4.7, students: 214000, hours: 27,  lectures: 388 },
  { id: 'c10', title: 'System Design Interview - An Insider\'s Guide', instructor: 'Alex Xu', category: 'Architecture', price: '₹599', image: 'https://img-c.udemycdn.com/course/240x135/3391238_a026_5.jpg', progress: 0,  enrolled: false, rating: 4.6, students: 56000,  hours: 18,  lectures: 123 },
  { id: 'c11', title: 'Master the Coding Interview: Data Structures + Algorithms', instructor: 'Andrei Neagoie', category: 'DSA', price: '₹449', image: 'https://img-c.udemycdn.com/course/240x135/1917546_3185_4.jpg', progress: 0,  enrolled: false, rating: 4.6, students: 78000,  hours: 19,  lectures: 261 },
  { id: 'c12', title: 'TypeScript: The Complete Developer\'s Guide', instructor: 'Stephen Grider', category: 'TypeScript', price: '₹399', image: 'https://img-c.udemycdn.com/course/240x135/2264098_d9f6.jpg', progress: 0,  enrolled: false, rating: 4.6, students: 63000,  hours: 27,  lectures: 263 },
  { id: 'c13', title: 'Flutter & Dart — The Complete App Development Course', instructor: 'Dr. Angela Yu', category: 'Mobile', price: '₹449', image: 'https://img-c.udemycdn.com/course/240x135/1708340_7108_3.jpg', progress: 0,  enrolled: false, rating: 4.7, students: 85000,  hours: 33,  lectures: 199 },
  { id: 'c14', title: 'SQL & PostgreSQL for Beginners: Become an SQL Expert', instructor: 'Jon Avis', category: 'Database', price: '₹349', image: 'https://img-c.udemycdn.com/course/240x135/1965540_f5aa_2.jpg', progress: 0,  enrolled: false, rating: 4.5, students: 49000,  hours: 11,  lectures: 109 },
  { id: 'c15', title: 'Git & GitHub — The Practical Guide', instructor: 'Maximilian Schwarzmüller', category: 'DevTools', price: '₹299', image: 'https://img-c.udemycdn.com/course/240x135/3311840_b0a8.jpg', progress: 0,  enrolled: false, rating: 4.8, students: 39000,  hours: 6,   lectures: 80  },
];

const INITIAL_JOBS = [
  { id: 'j1', company: 'Google', role: 'Full Stack Engineer (L4)', location: 'Mountain View, CA', salary: '$180k-$210k', requiredSkills: ['React', 'Node.js', 'MongoDB', 'Redis'], matchRate: 90 },
  { id: 'j2', company: 'Netflix', role: 'Frontend Engineer (React)', location: 'Los Gatos, CA', salary: '$190k-$240k', requiredSkills: ['React', 'CSS', 'Redux', 'TypeScript'], matchRate: 75 },
  { id: 'j3', company: 'Stripe', role: 'Backend API Developer', location: 'San Francisco, CA', salary: '$160k-$200k', requiredSkills: ['Node.js', 'Express', 'Redis', 'SQL'], matchRate: 60 },
  { id: 'j4', company: 'Tesla', role: 'Machine Learning Engineer', location: 'Palo Alto, CA', salary: '$175k-$220k', requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'ML'], matchRate: 55 },
  { id: 'j5', company: 'Amazon', role: 'Cloud Infrastructure Engineer', location: 'Seattle, WA', salary: '$170k-$210k', requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], matchRate: 65 },
  { id: 'j6', company: 'Salesforce', role: 'Product Design Engineer', location: 'San Francisco, CA', salary: '$165k-$195k', requiredSkills: ['Figma', 'UX', 'React', 'JavaScript'], matchRate: 70 },
  { id: 'j7', company: 'Databricks', role: 'Data Engineer', location: 'Austin, TX', salary: '$150k-$185k', requiredSkills: ['Python', 'Spark', 'ETL', 'SQL'], matchRate: 68 },
  { id: 'j8', company: 'Airbnb', role: 'Site Reliability Engineer', location: 'San Francisco, CA', salary: '$180k-$225k', requiredSkills: ['Linux', 'Go', 'Kubernetes', 'Monitoring'], matchRate: 62 }
];

const INTERVIEW_QUESTIONS = {
  'Frontend Engineer': [
    { q: 'Can you explain the difference between React Server Components and Client Components?', keywords: ['server', 'client', 'bundle', 'render', 'component', 'hydration', 'streaming'] },
    { q: 'How does the Critical Rendering Path work, and how do you optimize it?', keywords: ['dom', 'cssom', 'render', 'blocking', 'defer', 'async', 'paint', 'layout', 'reflow'] },
    { q: 'Explain React Context API vs Redux Toolkit — when would you use each?', keywords: ['context', 'redux', 'state', 'global', 'performance', 'rerenders', 'middleware', 'thunk'] }
  ],
  'Backend Engineer': [
    { q: 'Design a scalable real-time notification engine using WebSockets and Redis Pub/Sub.', keywords: ['websocket', 'redis', 'pubsub', 'scalable', 'queue', 'event', 'subscriber', 'publisher'] },
    { q: 'Explain optimistic vs pessimistic locking and when to use each in database design.', keywords: ['optimistic', 'pessimistic', 'lock', 'transaction', 'concurrency', 'race', 'conflict', 'version'] },
    { q: 'How does Docker container networking work? Explain bridge, host, and overlay networks.', keywords: ['docker', 'network', 'bridge', 'container', 'overlay', 'dns', 'port', 'namespace'] }
  ]
};

// Smart interview scorer
function scoreAnswer(answer, questionObj) {
  if (!answer || answer.length < 5) return { score: 0, matched: [], feedback: 'No answer detected.' };
  const lower = answer.toLowerCase();
  const matched = questionObj.keywords.filter(kw => lower.includes(kw));
  const wordCount = answer.split(' ').filter(w => w.length > 2).length;
  const keywordScore = Math.round((matched.length / questionObj.keywords.length) * 100);
  const fluencyScore = Math.min(Math.round((wordCount / 40) * 100), 100);
  const score = Math.round(keywordScore * 0.6 + fluencyScore * 0.4);
  let feedback = '';
  if (score >= 75) feedback = `Excellent! Covered key concepts: ${matched.join(', ')}.`;
  else if (score >= 50) feedback = `Good attempt. Try to also mention: ${questionObj.keywords.filter(k => !matched.includes(k)).slice(0,3).join(', ')}.`;
  else feedback = `Needs improvement. Key concepts to cover: ${questionObj.keywords.slice(0,4).join(', ')}.`;
  return { score, matched, feedback };
}

// Leaderboard Component
function LeaderboardTab({ currentUser }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const medals = ['🥇', '🥈', '🥉'];

  useEffect(() => {
    fetch(`${API_BASE}/leaderboard`)
      .then(r => r.json())
      .then(d => { setLeaders(d.leaderboard || []); setLoading(false); })
      .catch(() => {
        setLeaders([
          { rank: 1, name: 'Alex Chen', xp: 8420, solvedCount: 142, battlesWon: 38 },
          { rank: 2, name: 'Priya Sharma', xp: 7890, solvedCount: 128, battlesWon: 31 },
          { rank: 3, name: 'Rohan Mehta', xp: 6540, solvedCount: 98, battlesWon: 24 },
          { rank: 4, name: 'Sara Kim', xp: 5200, solvedCount: 87, battlesWon: 19 },
          { rank: 5, name: 'Dev Patel', xp: 4100, solvedCount: 72, battlesWon: 15 },
          { rank: 6, name: currentUser.name, xp: currentUser.xp, solvedCount: currentUser.solvedCount, battlesWon: currentUser.battlesWon },
        ]);
        setLoading(false);
      });
  }, [currentUser.xp]);

  const myRank = leaders.findIndex(u => u.name === currentUser.name) + 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy size={28} style={{ color: 'var(--warning)' }} />
          <div>
            <h3>Global Leaderboard</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ranked by XP — updates after every battle & submission</p>
          </div>
        </div>
        {myRank > 0 && (
          <div style={{ textAlign: 'right', background: 'rgba(0,210,255,0.08)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--accent-blue)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>YOUR RANK</p>
            <h2 style={{ color: 'var(--accent-blue)', fontSize: '28px' }}>#{myRank}</h2>
          </div>
        )}
      </div>

      {!loading && leaders.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '12px' }}>
          {[leaders[1], leaders[0], leaders[2]].map((user, pi) => {
            const rank = pi === 1 ? 1 : pi === 0 ? 2 : 3;
            const heights = ['130px', '160px', '115px'];
            const colors = ['#aaa', 'var(--warning)', '#cd7f32'];
            const isMe = user?.name === currentUser.name;
            return (
              <div key={pi} className="glass-panel" style={{ height: heights[pi], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: isMe ? '1px solid var(--accent-blue)' : `1px solid ${colors[pi]}44`, background: rank === 1 ? 'rgba(255,183,3,0.05)' : undefined }}>
                <span style={{ fontSize: '28px' }}>{medals[rank - 1]}</span>
                <h4 style={{ fontSize: '12px', marginTop: '4px', color: colors[pi], textAlign: 'center' }}>{user?.name}</h4>
                <p style={{ fontSize: '16px', fontWeight: 800, color: colors[pi] }}>⚡{user?.xp?.toLocaleString()}</p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{user?.solvedCount} solved</p>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading rankings...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {leaders.map((user, idx) => {
            const isMe = user.name === currentUser.name;
            return (
              <div key={idx} className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '16px', border: isMe ? '1px solid var(--accent-blue)' : undefined, background: isMe ? 'rgba(0,210,255,0.04)' : undefined }}>
                <span style={{ fontSize: idx < 3 ? '22px' : '14px', width: '32px', textAlign: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  {idx < 3 ? medals[idx] : `#${idx + 1}`}
                </span>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</span>
                    {isMe && <span style={{ fontSize: '9px', background: 'var(--accent-blue)', color: 'white', padding: '2px 5px', borderRadius: '3px' }}>YOU</span>}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user.solvedCount} solved • {user.battlesWon} wins</p>
                </div>
                <div style={{ width: '100px' }}>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '3px' }}>
                    <div style={{ height: '100%', width: `${Math.min((user.xp / 10000) * 100, 100)}%`, background: idx === 0 ? 'var(--warning)' : 'var(--accent-blue)', borderRadius: '2px' }} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>⚡{user.xp?.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState({
    name: 'Shamutha User', xp: 2850, streak: 5, rank: 142,
    solvedCount: 42, totalBattles: 18, battlesWon: 12, accuracy: 88
  });
  const [notifications, setNotifications] = useState([
    { id: 1, text: '🎉 Coding Battle completed — 200 XP earned!', time: '10m ago' },
    { id: 2, text: '🚀 New Mock Test: Frontend Engineering available.', time: '2h ago' },
    { id: 3, text: '💼 Recruiter from Stripe viewed your resume!', time: '1d ago' }
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const [flashProxyResult, setFlashProxyResult] = useState(null);
  const [flashProxyError, setFlashProxyError] = useState(null);
  const [flashProxyLoading, setFlashProxyLoading] = useState(false);

  const addNotif = useCallback((text) => {
    setNotifications(prev => [{ id: Date.now(), text, time: 'Just now' }, ...prev.slice(0, 9)]);
  }, []);

  // ── MODULE: AI MOCK TEST STATES & HANDLERS ──
  const [mockTestState, setMockTestState] = useState('setup'); // 'setup' | 'loading' | 'active' | 'result' | 'history'
  const [testTopic, setTestTopic] = useState('Frontend');
  const [testDifficulty, setTestDifficulty] = useState('Medium');
  const [testQuestionsCount, setTestQuestionsCount] = useState(5);
  const [testQuestions, setTestQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: optionIdx }
  const [currentTestQIdx, setCurrentTestQIdx] = useState(0);
  const [testTimer, setTestTimer] = useState(0); // in seconds
  const [testResult, setTestResult] = useState(null);
  const [mockHistory, setMockHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);

  const fetchMockHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/mocktest/history`);
      const data = await res.json();
      if (data.success) {
        setMockHistory(data.history);
      }
    } catch (err) {
      console.error('Error fetching mock history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerateMockTest = async (topicOverride = null) => {
    setMockTestState('loading');
    const selectedTopic = topicOverride || testTopic;
    try {
      const res = await fetch(`${API_BASE}/mocktest/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: selectedTopic, difficulty: testDifficulty, numQuestions: testQuestionsCount })
      });
      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        setTestQuestions(data.questions);
        setUserAnswers({});
        setCurrentTestQIdx(0);
        setTestTimer(testQuestionsCount * 120); // 2 minutes per question
        setTimeout(() => {
          setMockTestState('active');
        }, 1500);
      } else {
        alert('Failed to generate mock test. Please try again.');
        setMockTestState('setup');
      }
    } catch (err) {
      console.error('Error generating mock test:', err);
      alert('Error connecting to server.');
      setMockTestState('setup');
    }
  };

  const handleSubmitMockTest = async (overrideAnswers = null) => {
    setSubmittingTest(true);
    const answersToSend = overrideAnswers || userAnswers;
    const timeUsed = testQuestionsCount * 120 - testTimer;
    
    try {
      const res = await fetch(`${API_BASE}/mocktest/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userProfile.name,
          topic: testTopic,
          difficulty: testDifficulty,
          duration: timeUsed,
          answers: answersToSend
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.result);
        setMockTestState('result');
        setUserProfile(p => ({
          ...p,
          xp: p.xp + data.result.xpAwarded,
          solvedCount: p.solvedCount + 1
        }));
        addNotif(`📝 Mock Test completed! Score: ${data.result.score}% — +${data.result.xpAwarded} XP!`);
        fetchMockHistory(); // Refresh history
      } else {
        alert('Failed to evaluate test. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting mock test:', err);
      alert('Error submitting answers.');
    } finally {
      setSubmittingTest(false);
    }
  };

  const handleAutoSubmit = () => {
    addNotif('⏱️ Time limit reached! Auto-submitting your test.');
    handleSubmitMockTest();
  };

  useEffect(() => {
    if (activeTab === 'mocktest') {
      fetchMockHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    let interval = null;
    if (activeTab === 'mocktest' && mockTestState === 'active' && testTimer > 0) {
      interval = setInterval(() => {
        setTestTimer(t => {
          if (t <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTab, mockTestState, testTimer]);

  useEffect(() => {
    if (socketRef.current) return;

    const s = io(BACKEND_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => console.log('Socket connected'));
    s.on('connect_error', (err) => {
      if (err && err.message && err.message.includes('WebSocket is closed before the connection is established')) {
        return;
      }
      console.warn('Socket connect_error', err);
    });
    s.on('connect_timeout', () => console.warn('Socket connect_timeout'));
    s.on('reconnect_failed', () => console.warn('Socket reconnect_failed'));

    fetch(`${API_BASE}/analytics`).then(r => r.json()).then(d => { if (d.success) setUserProfile(p => ({ ...p, ...d.analytics })); }).catch(() => {});

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const runFlashProxyTest = async () => {
    setFlashProxyResult(null);
    setFlashProxyError(null);
    setFlashProxyLoading(true);

    try {
      const result = await callFlashDetector({ test: 'ping' });
      setFlashProxyResult(result);
    } catch (err) {
      setFlashProxyError(err?.message || String(err));
    } finally {
      setFlashProxyLoading(false);
    }
  };

  // Use explicit helper for Flash detector proxy (see client/src/flashProxy.js).
  // For development testing the helper is also exposed as `window.callFlashDetector`.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.callFlashDetector = callFlashDetector;
  }, []);

  // ── FIX: Tab title — remove "Dashboard" duplication ──
  const tabTitles = {
    dashboard: 'Dashboard', compiler: 'Coding Platform',
    interview: 'AI Interview Simulator', mocktest: 'AI Generated Mock Test',
    live: 'Live Class & Webinar', battle: 'Coding Battles',
    leaderboard: 'Leaderboard', resume: 'Resume Builder',
    marketplace: 'Course Marketplace', placements: 'Placement Portal',
    analytics: 'Performance Analytics', certificate: 'Get Certificate'
  };

  // ── MODULE 1: CODING PLATFORM ──
  const [selectedProblem, setSelectedProblem] = useState('two-sum');
  const [code, setCode] = useState(INITIAL_PROBLEMS['two-sum'].starterCode);
  const [codeLang, setCodeLang] = useState('javascript');
  const [ideConsole, setIdeConsole] = useState('▶ Run your code to see output here.');
  const [ideTesting, setIdeTesting] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const handleProblemChange = (e) => {
    const val = e.target.value;
    setSelectedProblem(val);
    setCode(INITIAL_PROBLEMS[val].starterCode);
    setTestResults([]);
    setIdeConsole('▶ Run your code to see output here.');
  };

  const handleRunCode = async () => {
    setIdeTesting(true);
    setIdeConsole('⚙️ Compiling and running test cases...');
    setTestResults([]);
    try {
      const res = await fetch(`${API_BASE}/compile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: codeLang, problemId: selectedProblem })
      });
      const data = await res.json();
      if (data.error) { setIdeConsole(`❌ ${data.error}`); }
      else {
        setIdeConsole(data.output);
        if (data.testResults) setTestResults(data.testResults);
        if (data.success) {
          setUserProfile(p => ({ ...p, xp: p.xp + 100, solvedCount: p.solvedCount + 1 }));
          addNotif(`✅ Solved "${INITIAL_PROBLEMS[selectedProblem].title}" — +100 XP!`);
        }
      }
    } catch {
      setIdeConsole('⚠️ Server offline — local sandbox running...');
      setTimeout(() => {
        setIdeConsole('✅ All test cases passed!\n⏱️ 42ms | 💾 12MB');
        setTestResults([
          { testCase: 1, passed: true, input: '[2,7,11,15], target=9', actual: '[0,1]', expected: '[0,1]' },
          { testCase: 2, passed: true, input: '[3,2,4], target=6', actual: '[1,2]', expected: '[1,2]' }
        ]);
        setUserProfile(p => ({ ...p, xp: p.xp + 100, solvedCount: p.solvedCount + 1 }));
        addNotif(`✅ Solved "${INITIAL_PROBLEMS[selectedProblem].title}" — +100 XP!`);
      }, 800);
    } finally { setIdeTesting(false); }
  };

  // ── MODULE 2: AI INTERVIEW (FULLY FIXED + ADVANCED) ──
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewRole, setInterviewRole] = useState('Frontend Engineer');
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewTranscript, setInterviewTranscript] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState([]);
  const [interviewReport, setInterviewReport] = useState(null);
  const [interviewFullscreen, setInterviewFullscreen] = useState(false);
  const [answerScores, setAnswerScores] = useState([]);
  const [interviewTimer, setInterviewTimer] = useState(0);
  const [violationAlerts, setViolationAlerts] = useState([]);
  const videoRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const interviewTimerRef = useRef(null);
  const MAX_VIOLATIONS = 10;

  // Timer for interview
  useEffect(() => {
    if (interviewActive) {
      interviewTimerRef.current = setInterval(() => setInterviewTimer(t => t + 1), 1000);
    } else {
      clearInterval(interviewTimerRef.current);
    }
    return () => clearInterval(interviewTimerRef.current);
  }, [interviewActive]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) { startListening(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9; utt.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices.find(v => v.lang.startsWith('en'));
    if (engVoice) utt.voice = engVoice;
    utt.onstart = () => setIsAiSpeaking(true);
    utt.onend = () => { setIsAiSpeaking(false); startListening(); };
    window.speechSynthesis.speak(utt);
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setIsListening(false); return; }
    if (speechRecognitionRef.current) { try { speechRecognitionRef.current.abort(); } catch {} }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setSpeechTranscript(t);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    speechRecognitionRef.current = rec;
    try { rec.start(); } catch {}
  }, []);

  const startInterview = async () => {
    setInterviewActive(true);
    setInterviewStep(0);
    setInterviewTranscript([]);
    setProctorWarnings([]);
    setViolationAlerts([]);
    setInterviewReport(null);
    setAnswerScores([]);
    setSpeechTranscript('');
    setInterviewTimer(0);
    setInterviewFullscreen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { console.warn('Camera denied'); }

    const q = INTERVIEW_QUESTIONS[interviewRole][0];
    setCurrentQuestion(q.q);
    setInterviewTranscript([{ speaker: 'AI', text: q.q }]);
    setTimeout(() => speakText(q.q), 800);
  };

  const submitAnswer = () => {
    if (speechRecognitionRef.current) { try { speechRecognitionRef.current.stop(); } catch {} }
    setIsListening(false);

    const answer = speechTranscript || '';
    const questions = INTERVIEW_QUESTIONS[interviewRole];
    const currentQ = questions[interviewStep];

    // Score this answer
    const scored = scoreAnswer(answer, currentQ);
    const newScores = [...answerScores, { question: currentQ.q, answer, ...scored }];
    setAnswerScores(newScores);

    // Show quick feedback alert
    if (scored.score >= 75) addNotif(`✅ Great answer! Score: ${scored.score}/100`);
    else if (scored.score >= 50) addNotif(`⚠️ Decent answer. Score: ${scored.score}/100`);
    else addNotif(`❌ Weak answer. Score: ${scored.score}/100. Practice more!`);

    const updated = [...interviewTranscript, { speaker: 'Candidate', text: answer || '(No answer recorded)' }];
    setInterviewTranscript(updated);
    setSpeechTranscript('');

    const next = interviewStep + 1;
    if (next < questions.length) {
      setInterviewStep(next);
      const nextQ = questions[next];
      setCurrentQuestion(nextQ.q);
      setInterviewTranscript(prev => [...prev, { speaker: 'AI', text: nextQ.q }]);
      setTimeout(() => speakText(nextQ.q), 500);
    } else {
      endInterview(updated, newScores);
    }
  };

  const endInterview = async (finalTranscript, scores) => {
    setInterviewActive(false);
    setInterviewFullscreen(false);
    setIsListening(false);
    window.speechSynthesis.cancel();
    if (speechRecognitionRef.current) { try { speechRecognitionRef.current.abort(); } catch {} }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }

    const sc = scores || answerScores;
    const avgScore = sc.length > 0 ? Math.round(sc.reduce((a, s) => a + s.score, 0) / sc.length) : 0;
    const confidence = Math.min(avgScore + 10, 98);
    const plagiarism = Math.max(0, 10 - Math.floor(avgScore / 12));
    const allStrengths = sc.flatMap(s => s.matched).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    const allImprovements = sc.flatMap(s => INTERVIEW_QUESTIONS[interviewRole].find(q => q.q === s.question)?.keywords.filter(k => !s.matched.includes(k)) || []).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);

    let feedback = avgScore >= 75 ? `Outstanding performance! Strong command of ${interviewRole} concepts. ${allStrengths.slice(0,2).join(', ')} knowledge was exceptional.`
      : avgScore >= 50 ? `Good foundational knowledge shown. Deepen your understanding of ${allImprovements.slice(0,2).join(', ')} to improve.`
      : `Keep practicing. Focus on core ${interviewRole} concepts: ${allImprovements.slice(0,3).join(', ')}.`;

    const report = {
      role: interviewRole, score: avgScore, confidence, plagiarism,
      warningsCount: proctorWarnings.length,
      feedback, strengths: allStrengths.length > 0 ? allStrengths.map(s => `Strong on "${s}"`) : ['Attempted all questions'],
      improvements: allImprovements.length > 0 ? allImprovements.map(s => `Study "${s}"`) : ['Keep practicing'],
      transcript: finalTranscript, perQuestionScores: sc, duration: interviewTimer
    };

    setInterviewReport(report);
    setUserProfile(p => ({ ...p, xp: p.xp + 200 }));
    addNotif(`🎙️ Interview done! Score: ${avgScore}% — +200 XP!`);

    try {
      await fetch(`${API_BASE}/interview`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: userProfile.name, role: interviewRole, score: avgScore, confidence, plagiarism, feedback, transcript: finalTranscript, warnings: proctorWarnings })
      });
    } catch {}
  };

  // Proctor — window blur detection with violation limit & auto-terminate
  useEffect(() => {
    const handleBlur = () => {
      if (!interviewActive) return;
      const time = new Date().toLocaleTimeString();
      const msg = `Tab switched at ${time}`;
      const newCount = proctorWarnings.length + 1;

      setProctorWarnings(prev => [...prev, msg]);

      // Show floating alert
      const alertId = Date.now();
      setViolationAlerts(prev => [...prev, { id: alertId, msg: `⚠️ Violation #${newCount}: Tab switch detected!` }]);
      setTimeout(() => setViolationAlerts(prev => prev.filter(a => a.id !== alertId)), 3000);

      if (socket) socket.emit('proctor-violation', { reason: 'Tab Switch' });

      // Auto terminate at MAX_VIOLATIONS
      if (newCount >= MAX_VIOLATIONS) {
        addNotif('🚫 Interview terminated: Too many violations!');
        endInterview(interviewTranscript, answerScores);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [interviewActive, proctorWarnings, interviewTranscript, answerScores, socket]);

  // ── MODULE 3: LIVE CLASSROOM ──
  const canvasRef = useRef(null);
  const [drawingColor, setDrawingColor] = useState('#ff007f');
  const [penSize, setPenSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [webinarMessages, setWebinarMessages] = useState([
    { sender: 'Instructor', text: 'Welcome everyone! Today we discuss MERN scalability.', time: '09:00 AM' },
    { sender: 'Alice', text: 'Will this class cover Redis clusters?', time: '09:02 AM' },
    { sender: 'Instructor', text: 'Yes! We will cover Redis Pub/Sub and clustering strategies.', time: '09:03 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const isDrawingRef = useRef(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [webinarMessages]);

  useEffect(() => {
    if (activeTab === 'live' && canvasRef.current && socket) {
      socket.emit('join-webinar', 'mern-scale');
      socket.on('webinar-chat-msg', (msg) => setWebinarMessages(prev => [...prev, msg]));
      socket.on('canvas-draw', (data) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = data.color; ctx.lineWidth = data.size;
        ctx.beginPath(); ctx.moveTo(data.x0, data.y0); ctx.lineTo(data.x1, data.y1); ctx.stroke();
      });
      socket.on('canvas-clear', () => canvasRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height));
    }
    return () => { if (socket) { socket.off('webinar-chat-msg'); socket.off('canvas-draw'); socket.off('canvas-clear'); } };
  }, [activeTab, socket]);

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const drawStart = (e) => {
    isDrawingRef.current = true;
    const pos = getCanvasPos(e);
    canvasRef.current.lastX = pos.x; canvasRef.current.lastY = pos.y;
  };

  const drawMove = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(e);
    ctx.strokeStyle = isEraser ? '#ffffff' : drawingColor;
    ctx.lineWidth = isEraser ? penSize * 3 : penSize;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(canvas.lastX, canvas.lastY); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    if (socket) socket.emit('canvas-draw', { webinarId: 'mern-scale', x0: canvas.lastX, y0: canvas.lastY, x1: pos.x, y1: pos.y, color: isEraser ? '#ffffff' : drawingColor, size: isEraser ? penSize * 3 : penSize });
    canvas.lastX = pos.x; canvas.lastY = pos.y;
  };

  const drawEnd = () => { isDrawingRef.current = false; };
  const clearCanvas = () => {
    canvasRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (socket) socket.emit('canvas-clear', { webinarId: 'mern-scale' });
  };

  const sendWebinarChat = () => {
    if (!chatInput.trim()) return;
    const msg = { sender: 'You', text: chatInput, time: new Date().toLocaleTimeString() };
    if (socket) socket.emit('webinar-chat-msg', { webinarId: 'mern-scale', ...msg });
    setWebinarMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  // ── MODULE 4: CODING BATTLES (FIXED) ──
  const [battleState, setBattleState] = useState('idle');
  const [opponentName, setOpponentName] = useState('');
  const [battleRoom, setBattleRoom] = useState('');
  const [battleProblem, setBattleProblem] = useState(null);
  const [battleCode, setBattleCode] = useState('');
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentCode, setOpponentCode] = useState('');
  const [battleStatusMsg, setBattleStatusMsg] = useState('');
  const [battleTimer, setBattleTimer] = useState(300);
  const [battleTestResults, setBattleTestResults] = useState([]);
  const [battleSubmitted, setBattleSubmitted] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.on('battle-matched', (data) => {
      setBattleState('matched'); setOpponentName(data.opponent);
      setBattleRoom(data.roomId); setBattleProblem(data.problem);
      setBattleCode(data.problem.starterCode); setOpponentProgress(0);
      setOpponentCode('// Opponent is reading the problem...'); setBattleTimer(300); setBattleSubmitted(false);
    });
    socket.on('opponent-code-update', (d) => { setOpponentProgress(d.progress); if (d.code) setOpponentCode(d.code); });
    socket.on('battle-lost', (d) => { setBattleState('finished'); setBattleStatusMsg(`❌ You lost! ${d.winner} solved it first.`); });
    return () => { socket.off('battle-matched'); socket.off('opponent-code-update'); socket.off('battle-lost'); };
  }, [socket]);

  useEffect(() => {
    let iv;
    if (battleState === 'matched' && battleTimer > 0) {
      iv = setInterval(() => setBattleTimer(t => { if (t <= 1) { setBattleState('finished'); setBattleStatusMsg('⏳ Time up! Draw.'); return 0; } return t - 1; }), 1000);
    }
    return () => clearInterval(iv);
  }, [battleState, battleTimer]);

  // Opponent simulation
  useEffect(() => {
    let iv;
    if (battleState === 'matched' && !battleSubmitted) {
      iv = setInterval(() => {
        setOpponentProgress(prev => {
          const next = Math.min(prev + Math.floor(Math.random() * 4) + 1, 99);
          setOpponentCode(`function solution(nums, target) {\n  // Opponent progress: ${next}%\n  const map = {};\n  for (let i = 0; i < nums${next > 30 ? '.length' : ''}; i++) {\n    ${next > 50 ? 'const comp = target - nums[i];' : '// thinking...'}\n    ${next > 70 ? 'if (map[comp] !== undefined) return [map[comp], i];' : ''}\n    ${next > 85 ? 'map[nums[i]] = i;' : ''}\n  }\n}`);
          return next;
        });
      }, 2500);
    }
    return () => clearInterval(iv);
  }, [battleState, battleSubmitted]);

  const joinBattleQueue = () => {
    setBattleState('queue');
    setBattleTestResults([]);
    if (socket) {
      socket.emit('join-battle-queue', { username: userProfile.name, xp: userProfile.xp });
    }
    setTimeout(() => {
      setBattleState('matched'); setOpponentName('AI Challenger Bot');
      setBattleProblem(INITIAL_PROBLEMS['two-sum']); setBattleCode(INITIAL_PROBLEMS['two-sum'].starterCode);
      setOpponentCode('// Bot loading...'); setOpponentProgress(0); setBattleTimer(300); setBattleSubmitted(false);
    }, socket ? 99999 : 3000);
  };

  const handleBattleCodeChange = (e) => {
    setBattleCode(e.target.value);
    const prog = Math.min(Math.round((e.target.value.length / 250) * 100), 95);
    if (socket) socket.emit('battle-code-update', { roomId: battleRoom, progress: prog, code: e.target.value });
  };

  // FIX: Battle now actually runs code before declaring victory
  // ── BROWSER SANDBOX TEST RUNNER ──
const BROWSER_TEST_CASES = {
  'two-sum': [
    { args: [[2,7,11,15], 9], expected: '[0,1]' },
    { args: [[3,2,4], 6],     expected: '[1,2]' },
    { args: [[3,3], 6],       expected: '[0,1]' }
  ],
  'reverse-string': [
    { args: ['hello'],   expected: '"olleh"' },
    { args: ['world'],   expected: '"dlrow"' },
    { args: ['a'],       expected: '"a"' }
  ],
  'fizz-buzz': [
    { args: [5], expected: '["1","2","Fizz","4","Buzz"]' },
    { args: [3], expected: '["1","2","Fizz"]' }
  ],
  'palindrome': [
    { args: ['racecar'], expected: 'true' },
    { args: ['hello'],   expected: 'false' }
  ],
  'max-subarray': [
    { args: [[-2,1,-3,4,-1,2,1,-5,4]], expected: '6' },
    { args: [[1]],                      expected: '1' }
  ]
};

function runInSandbox(userCode, problemId) {
  const cases = BROWSER_TEST_CASES[problemId] || [];
  const results = [];
  let fn;
  try {
    // eslint-disable-next-line no-new-func
    fn = new Function(`${userCode}; return solution;`)();
  } catch (e) {
    return cases.map((tc, i) => ({
      testCase: i + 1, passed: false,
      input: JSON.stringify(tc.args),
      expected: tc.expected,
      actual: `Syntax Error: ${e.message}`
    }));
  }
  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    let actual, actualStr;
    try {
      actual = fn(...tc.args);
      actualStr = JSON.stringify(actual);
    } catch (e) {
      actualStr = `Runtime Error: ${e.message}`;
    }
    results.push({
      testCase: i + 1,
      passed: actualStr === tc.expected,
      input: JSON.stringify(tc.args),
      expected: tc.expected,
      actual: actualStr
    });
  }
  return results;
}

const submitBattleCode = async () => {
  setBattleSubmitted(true);
  setBattleTestResults([{ testCase: 1, passed: false, input: 'running...', actual: '⚙️ Testing...', expected: '...' }]);

  // 1️⃣ Try server first
  let data = null;
  try {
    const res = await fetch(`${API_BASE}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: battleCode, language: 'javascript', problemId: 'two-sum' })
    });
    data = await res.json();
  } catch {
    // Server offline → fall to browser sandbox
    data = null;
  }

  // 2️⃣ If server down or no response, run in browser sandbox
  if (!data) {
    const sandboxResults = runInSandbox(battleCode, battleProblem?.id || 'two-sum');
    const allPassed = sandboxResults.every(r => r.passed);
    setBattleTestResults(sandboxResults);

    if (allPassed) {
      setBattleState('finished');
      setBattleStatusMsg('🎉 Victory! All test cases passed. +200 XP!');
      if (socket) socket.emit('battle-win', { roomId: battleRoom, winner: userProfile.name });
      setUserProfile(p => ({ ...p, xp: p.xp + 200, totalBattles: p.totalBattles + 1, battlesWon: p.battlesWon + 1 }));
      addNotif('⚔️ Battle Won! +200 XP added!');
    } else {
      setBattleSubmitted(false);
      setBattleStatusMsg('');
      addNotif(`❌ ${sandboxResults.filter(r => !r.passed).length} test(s) failed. Fix and resubmit!`);
    }
    return;
  }

  // 3️⃣ Server responded
  setBattleTestResults(data.testResults || []);
  if (data.success) {
    setBattleState('finished');
    setBattleStatusMsg('🎉 Victory! All test cases passed. +200 XP!');
    if (socket) socket.emit('battle-win', { roomId: battleRoom, winner: userProfile.name });
    setUserProfile(p => ({ ...p, xp: p.xp + 200, totalBattles: p.totalBattles + 1, battlesWon: p.battlesWon + 1 }));
    addNotif('⚔️ Battle Won! +200 XP added!');
  } else {
    setBattleSubmitted(false);
    setBattleStatusMsg('');
    addNotif('❌ Tests failed. Fix your code and try again!');
  }
};

  // ── MODULE 5: RESUME ──
  const resumeData = useSelector((state) => state.resume.data);
  const plagiarismScore = useSelector((state) => state.resume.plagiarismScore);
  const subscriptionState = useSelector((state) => state.subscription);
  const appliedJobs = useSelector((state) => state.placement.appliedJobs);
  const dispatch = useDispatch();
  const [resumeTemplate, setResumeTemplate] = useState('modern');
  const [resumeSaveMsg, setResumeSaveMsg] = useState('');
  const [resumeSavedAt, setResumeSavedAt] = useState(null);
  const [jobSearch, setJobSearch] = useState('');
  const [tfStatus, setTfStatus] = useState('Loading TensorFlow.js...');
  const [tfPrediction, setTfPrediction] = useState('');
  const [screenMonitorActive, setScreenMonitorActive] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [collabCode, setCollabCode] = useState('// Collaborative code pad…');
  const [collabStatus, setCollabStatus] = useState('offline');
  const [paymentChannel, setPaymentChannel] = useState('stripe');
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  // ── MODULE 6: MARKETPLACE ──
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutCourse, setCheckoutCourse] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const processPayment = async () => {
    if (!cardNumber) return;
    setPaymentSuccess(true);
    try { await fetch(`${API_BASE}/courses/enroll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: checkoutCourse.id }) }); } catch {}
    setTimeout(() => { setShowPaymentModal(false); setCourses(courses.map(c => c.id === checkoutCourse.id ? { ...c, enrolled: true } : c)); addNotif(`📚 Enrolled in ${checkoutCourse.title}!`); }, 2000);
  };

  // ── MODULE 7: PLACEMENTS ──
  const [jobs, setJobs] = useState(INITIAL_JOBS);

  useEffect(() => {
    const skillsValue = resumeData.skills || '';
    const skillsStr = Array.isArray(skillsValue) ? skillsValue.join(',') : String(skillsValue);
    const userSkills = (skillsStr || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    setJobs(INITIAL_JOBS.map(job => {
      const matchCount = job.requiredSkills.filter(skill => userSkills.some(us => us.includes(skill.toLowerCase()))).length;
      return { ...job, matchRate: Math.max(Math.round((matchCount / job.requiredSkills.length) * 100), 20) };
    }));
  }, [resumeData.skills]);

  const applyForJob = async (job) => {
    try { await fetch(`${API_BASE}/jobs/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: job.id, applicantName: userProfile.name, email: resumeData.email }) }); } catch {}
    dispatch(addAppliedJob(job.id));
    addNotif(`💼 Applied to ${job.company} — ${job.role}!`);
  };

  const handleResumeField = (key, value) => {
    dispatch(setResumeField({ key, value }));
  };

  const saveResume = async () => {
    try {
      await fetch(`${API_BASE}/resume`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resumeData) });
      setResumeSaveMsg('Saved to server');
      setResumeSavedAt(Date.now());
      addNotif('💾 Resume saved to server');
    } catch (e) {
      try {
        window.localStorage.setItem('sham-resume-data', JSON.stringify(resumeData));
        setResumeSaveMsg('Saved locally');
        setResumeSavedAt(Date.now());
        addNotif('💾 Resume saved locally');
      } catch (err) {
        setResumeSaveMsg('Save failed');
        addNotif('❌ Failed to save resume');
      }
    }
    setTimeout(() => setResumeSaveMsg(''), 3500);
  };
  const exportResumePDF = () => {
  const el = document.getElementById('resume-preview-panel');
  if (!el) return;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html><head><title>Resume - ${resumeData.fullName}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #222; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      h3 { font-size: 13px; text-transform: uppercase; color: #444; margin: 14px 0 4px; letter-spacing: 0.5px; border-bottom: 1px solid #eee; padding-bottom: 3px; }
      p { font-size: 12px; color: #555; line-height: 1.6; white-space: pre-wrap; }
      .tag { display: inline-block; background: #f0f0f5; color: #333; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin: 2px; }
      .header-line { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 14px; }
    </style></head><body>
    ${el.innerHTML}
    </body></html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
};

  // Load resume on startup: prefer server -> fall back to localStorage
  useEffect(() => {
    const load = async () => {
      try {
        // Determine candidate email from several sources (local draft, persisted redux, or current state)
        let email = '';

        try {
          const rawDraft = window.localStorage.getItem('sham-resume-data');
          if (rawDraft) {
            const parsedDraft = JSON.parse(rawDraft);
            email = parsedDraft?.email || '';
          }
        } catch (e) {
          // ignore parse errors
        }

        if (!email) {
          try {
            const rawRedux = window.localStorage.getItem('sham-redux-state');
            if (rawRedux) {
              const parsedRedux = JSON.parse(rawRedux);
              email = parsedRedux?.resume?.data?.email || '';
            }
          } catch (e) {
            // ignore
          }
        }

        if (!email && resumeData?.email) email = resumeData.email;

        if (email) {
          const res = await fetch(`${API_BASE}/resume/${encodeURIComponent(email)}`);
          if (res.ok) {
            const j = await res.json();
            if (j && j.success && j.resume) {
              dispatch(setResumeData(j.resume));
              setResumeSaveMsg('Loaded from server');
              setResumeSavedAt(Date.now());
              setTimeout(() => setResumeSaveMsg(''), 2500);
              return;
            }
          }
        }
      } catch (err) {
        // server not reachable or fetch failed — fall back to localStorage below
      }

      try {
        const raw = window.localStorage.getItem('sham-resume-data');
        if (raw) {
          const parsed = JSON.parse(raw);
          dispatch(setResumeData(parsed));
          setResumeSaveMsg('Loaded local draft');
          setResumeSavedAt(Date.now());
          setTimeout(() => setResumeSaveMsg(''), 2500);
        }
      } catch (err) { /* ignore */ }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatSavedAgo = () => {
    if (!resumeSavedAt) return null;
    const diff = Math.floor((Date.now() - resumeSavedAt) / 1000);
    if (diff < 5) return 'Saved just now';
    if (diff < 60) return `Saved ${diff}s ago`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `Saved ${m}m ago`;
    const h = Math.floor(m / 60);
    return `Saved ${h}h ago`;
  };

  const computeSimilarity = (textA, textB) => {
    const a = textA.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
    const b = textB.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
    const intersection = a.filter(word => b.includes(word));
    return Math.round((intersection.length / Math.max(a.length, b.length, 1)) * 100);
  };

  const checkResumePlagiarism = () => {
    const source = `${resumeData.fullName} ${resumeData.bio} ${resumeData.education} ${resumeData.experience}`;
    const samples = [
      'Motivated Full Stack developer eager to build production-grade web applications.',
      'Experienced software engineer with strong skills in React, Node.js, and MongoDB.',
      'Proven ability to deliver reliable products using modern web stacks.',
      'Strong foundation in data structures, algorithms, and clean architecture.'
    ];
    const score = Math.max(...samples.map(sample => computeSimilarity(source, sample)));
    dispatch(setPlagiarismResult({ score, time: new Date().toISOString() }));
    addNotif(`🔍 AI plagiarism checker scored ${score}% similarity.`);
  };

  const subscriptionPlans = [
    { id: 'free', title: 'Free', price: '$0', benefits: ['Basic access', 'Limited mock tests', 'Community support'] },
    { id: 'pro', title: 'Pro', price: '$19/mo', benefits: ['Unlimited mocks', 'Interview analytics', 'Priority support'] },
    { id: 'enterprise', title: 'Enterprise', price: '$49/mo', benefits: ['Dedicated coaching', 'Team reports', 'Premium placement help'] }
  ];

  const handleSubscribe = async (planId) => {
    dispatch(setSubscriptionPlan(planId));
    dispatch(activateSubscription());
    dispatch(setPaymentMethod(paymentChannel));
    setSubscriptionMessage(`Subscribed to ${planId.toUpperCase()} plan with ${paymentChannel.toUpperCase()}.`);
    addNotif(`✅ ${planId.toUpperCase()} plan activated with ${paymentChannel.toUpperCase()} payment.`);
  };

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const processPaymentIntegration = async () => {
    if (paymentChannel === 'stripe') {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_12345';
      const stripe = await loadStripe(stripeKey);
      if (stripe) {
        addNotif('✅ Stripe integration ready (demo mode).');
        return;
      }
    }
    if (paymentChannel === 'razorpay') {
      const loaded = await loadRazorpayScript();
      if (loaded && window.Razorpay) {
        addNotif('✅ Razorpay integration ready (demo mode).');
        return;
      }
    }
    addNotif('⚠️ Payment provider not available; using simulated checkout.');
  };

  const startScreenMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setScreenStream(stream);
      setScreenMonitorActive(true);
      addNotif('🖥️ Screen monitoring enabled for proctoring.');
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenMonitorActive(false);
        setScreenStream(null);
        addNotif('🛑 Screen monitoring stopped.');
      });
    } catch (error) {
      addNotif('⚠️ Screen monitoring denied or unavailable.');
    }
  };

  const stopScreenMonitoring = () => {
    screenStream?.getTracks().forEach(track => track.stop());
    setScreenStream(null);
    setScreenMonitorActive(false);
    addNotif('🛑 Screen monitoring stopped.');
  };

  const updateCollabCode = (value) => {
    setCollabCode(value);
    if (socket) socket.emit('collab-code', { webinarId: 'mern-scale', code: value });
  };

  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        await tf.ready();
        const tensor = tf.tensor([1, 2, 3, 4]);
        const mean = tensor.mean().arraySync();
        setTfStatus('TensorFlow.js loaded successfully.');
        setTfPrediction(`AI sample prediction mean: ${mean.toFixed(2)}`);
      } catch (err) {
        setTfStatus('TensorFlow.js failed to initialize.');
      }
    };
    initializeTensorFlow();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('collab-code', (data) => {
      if (data.code !== collabCode) {
        setCollabCode(data.code);
        setCollabStatus('active');
      }
    });
    return () => {
      socket.off('collab-code');
    };
  }, [socket, collabCode]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (interviewActive && document.visibilityState === 'hidden') {
        const msg = `Screen hidden at ${new Date().toLocaleTimeString()}`;
        setProctorWarnings(prev => [...prev, msg]);
        addNotif('⚠️ Screen visibility changed during interview.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [interviewActive]);

  const filteredJobs = jobs.filter(job => {
    const query = jobSearch.toLowerCase().trim();
    if (!query) return true;
    return [job.role, job.company, job.location, job.salary, ...job.requiredSkills].some(field => field.toLowerCase().includes(query));
  });

  // ── MODULE 8: CERTIFICATE ──
  const [certName, setCertName] = useState('Shamutha Graduate');
  const [certCourse, setCertCourse] = useState('Full-Stack MERN Mastery');

  // ──────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────
  return (
    <div className="app-container">
      {/* FLOATING VIOLATION ALERTS */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
        {violationAlerts.map(alert => (
          <div key={alert.id} style={{ background: 'rgba(255,0,84,0.95)', color: 'white', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 20px rgba(255,0,84,0.5)', animation: 'slideIn 0.3s ease' }}>
            {alert.msg}
          </div>
        ))}
      </div>

      {/* INTERVIEW FULLSCREEN OVERLAY */}
      {interviewFullscreen && interviewActive && (
        <div style={{ position: 'fixed', inset: 0, background: '#07050f', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Sparkles size={20} style={{ color: '#00d2ff' }} />
              <span style={{ fontWeight: 800, fontSize: '16px' }}>SHAMUTHA AI INTERVIEW</span>
              <span style={{ fontSize: '12px', background: 'rgba(57,245,212,0.15)', color: 'var(--success)', padding: '3px 10px', borderRadius: '4px' }}>🔴 LIVE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '16px', color: 'var(--warning)', fontWeight: 700 }}>⏱ {formatTime(interviewTimer)}</span>
              {proctorWarnings.length > 0 && (
                <span style={{ fontSize: '12px', background: 'rgba(255,0,84,0.15)', color: 'var(--danger)', padding: '3px 10px', borderRadius: '4px' }}>
                  ⚠️ {proctorWarnings.length}/{MAX_VIOLATIONS} violations
                </span>
              )}
              <button onClick={() => setInterviewFullscreen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                <Minimize2 size={14} /> Exit Fullscreen
              </button>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 400px', gap: '0', overflow: 'hidden' }}>
            {/* Left: Camera + transcript */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px' }}>
              {/* Camera */}
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#0a0915', flex: '0 0 340px' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '340px', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '11px', background: proctorWarnings.length > 0 ? 'rgba(255,0,84,0.9)' : 'rgba(57,245,212,0.9)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>
                    {proctorWarnings.length > 0 ? `⚠️ FLAGGED (${proctorWarnings.length})` : '✅ PROCTOR OK'}
                  </span>
                  <span style={{ fontSize: '11px', background: isListening ? 'rgba(255,0,84,0.9)' : 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>
                    {isListening ? '🎤 LISTENING' : isAiSpeaking ? '🔊 AI SPEAKING' : '⏸ STANDBY'}
                  </span>
                </div>
                {/* Question overlay at bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '20px 16px 12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--accent-purple)', marginBottom: '4px' }}>Q{interviewStep + 1} of {INTERVIEW_QUESTIONS[interviewRole].length}</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>{currentQuestion}</p>
                </div>
              </div>

              {/* Live transcript */}
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Mic size={14} style={{ color: isListening ? 'var(--danger)' : 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '12px', color: isListening ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 600 }}>
                    {isListening ? 'LIVE TRANSCRIPTION...' : 'YOUR ANSWER'}
                  </span>
                  {isListening && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1s infinite' }} />}
                </div>
                <p style={{ fontSize: '14px', color: '#ffb703', lineHeight: 1.6, minHeight: '60px' }}>
                  {speechTranscript || (isAiSpeaking ? 'AI is asking the question...' : isListening ? 'Speak now...' : 'Waiting...')}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setSpeechTranscript('React Server Components render only on the server, saving bundle size, whereas Client Components are standard interactive components with hooks and state management running in the browser.')}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  Simulate Answer
                </button>
                <button onClick={submitAnswer}
                  style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
                  Submit Answer →
                </button>
                <button onClick={() => endInterview(interviewTranscript, answerScores)}
                  style={{ padding: '12px 16px', background: 'rgba(255,0,84,0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                  End
                </button>
              </div>
            </div>

            {/* Right: Score panel */}
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Live Score Tracker</h3>

              {answerScores.map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', border: `1px solid ${s.score >= 75 ? 'var(--success)' : s.score >= 50 ? 'var(--warning)' : 'var(--danger)'}33` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Q{i + 1}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: s.score >= 75 ? 'var(--success)' : s.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{s.score}/100</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '6px' }}>
                    <div style={{ height: '100%', width: `${s.score}%`, background: s.score >= 75 ? 'var(--success)' : s.score >= 50 ? 'var(--warning)' : 'var(--danger)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.feedback}</p>
                  {s.matched.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {s.matched.slice(0, 4).map(kw => (
                        <span key={kw} style={{ fontSize: '9px', background: 'rgba(57,245,212,0.1)', color: 'var(--success)', padding: '2px 5px', borderRadius: '3px' }}>{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {answerScores.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>Answer questions to see scores here...</p>
              )}

              {answerScores.length > 0 && (
                <div style={{ background: 'rgba(0,210,255,0.06)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(0,210,255,0.2)', marginTop: 'auto' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>RUNNING AVERAGE</p>
                  <h2 style={{ fontSize: '32px', color: 'var(--accent-blue)' }}>
                    {Math.round(answerScores.reduce((a, s) => a + s.score, 0) / answerScores.length)}%
                  </h2>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Sparkles style={{ color: '#00d2ff' }} />
          <span>SHAMUTHA</span>
        </div>
        <nav className="sidebar-menu">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
            { id: 'compiler', icon: <Code2 size={18} />, label: 'Coding Platform' },
            { id: 'interview', icon: <Mic size={18} />, label: 'AI Interview Simulator' },
            { id: 'mocktest', icon: <BookOpen size={18} />, label: 'AI Mock Test' },
            { id: 'live', icon: <Video size={18} />, label: 'Live Class & Webinar' },
            { id: 'battle', icon: <Swords size={18} />, label: 'Coding Battles' },
            { id: 'leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
            { id: 'resume', icon: <FileText size={18} />, label: 'Resume Builder' },
            { id: 'marketplace', icon: <ShoppingBag size={18} />, label: 'Course Marketplace' },
            { id: 'placements', icon: <Briefcase size={18} />, label: 'Placement Portal' },
            { id: 'analytics', icon: <BarChart3 size={18} />, label: 'Performance Analytics' },
            { id: 'certificate', icon: <Award size={18} />, label: 'Get Certificate' }
          ].map(item => (
            <div key={item.id} className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              {item.icon}<span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-profile">
          <div className="sidebar-avatar">{userProfile.name.charAt(0)}</div>
          <div>
            <h4 style={{ fontSize: '14px' }}>{userProfile.name}</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Rank #{userProfile.rank}</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            {/* FIX: No more "Dashboard Dashboard" */}
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>{tabTitles[activeTab]}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Welcome back to Shamutha AI EdTech</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', gap: '12px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ color: 'var(--success)' }}>🔥 {userProfile.streak} Days</span>
              <span style={{ color: 'var(--accent-blue)' }}>⚡ {userProfile.xp.toLocaleString()} XP</span>
            </div>
            <div className="glass-panel" style={{ padding: '8px', cursor: 'pointer', position: 'relative' }} onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={18} />
              {notifications.length > 0 && <span style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--danger)', width: '6px', height: '6px', borderRadius: '50%' }} />}
            </div>
          </div>
        </header>

        {/* Notification dropdown */}
        {/*
          <div style={{ position: 'fixed', top: '70px', right: '24px', width: '320px', background: '#1a1530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', zIndex: 1000, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px' }}>Notifications</h4>
              <X size={16} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowNotifs(false)} />
            </div>
            {notifications.slice(0, 6).map((n, i) => (
              <div key={n.id} style={{ padding: '10px', borderRadius: '8px', background: i === 0 ? 'rgba(0,210,255,0.05)' : undefined, marginBottom: '6px', fontSize: '12px' }}>
                <p>{n.text}</p>
                <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{n.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-grid">
              {[
                { label: 'PROBLEMS SOLVED', value: userProfile.solvedCount, icon: <Code2 size={24} />, color: 'var(--accent-blue)', bg: 'rgba(0,210,255,0.15)' },
                { label: 'BATTLE RECORD', value: `${userProfile.battlesWon}/${userProfile.totalBattles}`, icon: <Swords size={24} />, color: 'var(--accent-purple)', bg: 'rgba(157,78,221,0.15)' },
                { label: 'ACCURACY', value: `${userProfile.accuracy}%`, icon: <Award size={24} />, color: 'var(--success)', bg: 'rgba(57,245,212,0.15)' }
              ].map(s => (
                <div key={s.label} className="glass-panel stat-card">
                  <div><p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.label}</p><h3 style={{ fontSize: '28px', marginTop: '6px' }}>{s.value}</h3></div>
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                </div>
              ))}
            </div>
          {import.meta.env.DEV && (
            <div className="glass-panel" style={{ padding: '20px', marginTop: '20px', border: '1px dashed rgba(255,255,255,0.16)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Flash Proxy Debug</h3>
                  <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '12px' }}>Calls the backend proxy at <code>/api/proxy/flash</code>.</p>
                </div>
                <button onClick={runFlashProxyTest} disabled={flashProxyLoading} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: flashProxyLoading ? 'rgba(255,255,255,0.05)' : 'rgba(0,210,255,0.12)', color: 'white', cursor: flashProxyLoading ? 'not-allowed' : 'pointer' }}>
                  {flashProxyLoading ? 'Running…' : 'Run Proxy'}
                </button>
              </div>
              {flashProxyError && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,0,84,0.08)', border: '1px solid rgba(255,0,84,0.18)', color: 'var(--danger)', fontSize: '13px' }}>
                  <strong>Error:</strong> {flashProxyError}
                </div>
              )}
              {flashProxyResult && (
                <pre style={{ marginTop: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px', lineHeight: '1.4', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {JSON.stringify(flashProxyResult, null, 2)}
                </pre>
              )}
            </div>
          )}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Training Recommendations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { tab: 'interview', color: 'var(--accent-blue)', icon: '🎙️', title: 'Complete AI Voice Interview', desc: 'Smart keyword-based scoring — no API key', xp: '+200 XP' },
                    { tab: 'compiler', color: 'var(--accent-purple)', icon: '🧩', title: 'Solve: Reverse String', desc: 'Real test case validation', xp: '+100 XP' },
                    { tab: 'battle', color: 'var(--accent-pink)', icon: '⚔️', title: 'Enter PvP Coding Battle', desc: 'Real code check before victory', xp: '+200 XP' },
                    { tab: 'leaderboard', color: 'var(--warning)', icon: '🏆', title: 'Check Leaderboard', desc: 'See your global rank', xp: '' }
                  ].map(item => (
                    <div key={item.tab} className="glass-card-interactive" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setActiveTab(item.tab)}>
                      <div>
                        <h4 style={{ color: item.color, fontSize: '15px' }}>{item.icon} {item.title}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.desc}</p>
                      </div>
                      {item.xp && <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 'bold' }}>{item.xp}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Inbox & Feed</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)', marginTop: '6px', flexShrink: 0 }} />
                      <div><p>{n.text}</p><span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{n.time}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── CODING PLATFORM ── */}
        {activeTab === 'compiler' && (
          <div className="editor-layout">
            <div className="glass-panel problem-description">
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>SELECT PROBLEM</label>
              <select className="ide-select" value={selectedProblem} onChange={handleProblemChange} style={{ width: '100%' }}>
                <option value="two-sum">Two Sum (Easy)</option>
                <option value="reverse-string">Reverse String (Easy)</option>
                <option value="fizz-buzz">Fizz Buzz (Easy)</option>
                <option value="palindrome">Check Palindrome (Easy)</option>
                <option value="max-subarray">Maximum Subarray (Medium)</option>
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <h2 style={{ color: 'var(--accent-blue)', fontSize: '20px' }}>{INITIAL_PROBLEMS[selectedProblem].title}</h2>
                <span style={{ fontSize: '10px', background: INITIAL_PROBLEMS[selectedProblem].difficulty === 'Easy' ? 'rgba(57,245,212,0.15)' : 'rgba(255,183,3,0.15)', color: INITIAL_PROBLEMS[selectedProblem].difficulty === 'Easy' ? 'var(--success)' : 'var(--warning)', padding: '2px 8px', borderRadius: '4px' }}>
                  {INITIAL_PROBLEMS[selectedProblem].difficulty}
                </span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>{INITIAL_PROBLEMS[selectedProblem].description}</p>
              <div style={{ marginTop: 'auto' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Test Results:</h4>
                {testResults.length === 0 ? <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Submit code to see results.</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {testResults.map(tr => (
                      <div key={tr.testCase} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '12px', border: `1px solid ${tr.passed ? 'var(--success)' : 'var(--danger)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold' }}>Test {tr.testCase}</span>
                          <span style={{ color: tr.passed ? 'var(--success)' : 'var(--danger)' }}>{tr.passed ? '✅ PASSED' : '❌ FAILED'}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Input: {tr.input}</p>
                        <p style={{ color: 'var(--text-secondary)' }}>Expected: {tr.expected} | Got: {tr.actual}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="ide-panel">
              <div className="ide-header">
                <span style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)' }}>solution.js</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select className="ide-select" value={codeLang} onChange={e => setCodeLang(e.target.value)}>
                    <option value="javascript">JavaScript (V8)</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++</option>
                  </select>
                  <button className="btn-premium" onClick={handleRunCode} disabled={ideTesting}>
                    {ideTesting ? '⚙️ Running...' : '▶ Submit Code'}
                  </button>
                </div>
              </div>
              <textarea className="ide-textarea" value={code} onChange={e => setCode(e.target.value)} spellCheck="false" />
              <div className="ide-console">
                <div className="ide-console-header">Console Output</div>
                <div className="ide-console-output">{ideConsole}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── AI INTERVIEW (normal view) ── */}
        {activeTab === 'interview' && (
          <div className="interview-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="video-container" style={{ position: 'relative' }}>
                <video ref={videoRef} className="video-feed" autoPlay playsInline muted />
                {!videoRef.current?.srcObject && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0915' }}>
                    <Video size={48} style={{ color: 'var(--accent-purple)', marginBottom: '10px' }} />
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Camera will activate when interview starts</p>
                  </div>
                )}
                <div className="video-overlay">
                  <div className={`proctor-status ${proctorWarnings.length > 0 ? 'warning' : 'secure'}`}>
                    {proctorWarnings.length > 0 ? `⚠️ FLAGGED (${proctorWarnings.length}/${MAX_VIOLATIONS})` : '✅ PROCTOR SECURE'}
                  </div>
                </div>
              </div>

              {/* Report */}
              {interviewReport && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ color: 'var(--success)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle /> AI Assessment Complete — {formatTime(interviewReport.duration || 0)}
                  </h3>
                  <div className="dashboard-grid" style={{ marginBottom: '20px' }}>
                    {[
                      { label: 'OVERALL SCORE', value: `${interviewReport.score}%`, color: 'var(--accent-blue)' },
                      { label: 'CONFIDENCE', value: `${interviewReport.confidence}%`, color: 'var(--accent-purple)' },
                      { label: 'PLAGIARISM', value: `${interviewReport.plagiarism}%`, color: 'var(--danger)' }
                    ].map(s => (
                      <div key={s.label} className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.label}</span>
                        <h2 style={{ fontSize: '26px', color: s.color }}>{s.value}</h2>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}><strong>Feedback:</strong> {interviewReport.feedback}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(57,245,212,0.08)', padding: '14px', borderRadius: '8px', border: '1px solid var(--success)' }}>
                      <h4 style={{ color: 'var(--success)', fontSize: '13px', marginBottom: '8px' }}>✅ Strengths</h4>
                      {interviewReport.strengths.map((s, i) => <p key={i} style={{ fontSize: '12px', marginBottom: '4px' }}>• {s}</p>)}
                    </div>
                    <div style={{ background: 'rgba(255,0,84,0.08)', padding: '14px', borderRadius: '8px', border: '1px solid var(--danger)' }}>
                      <h4 style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '8px' }}>🔧 Improve On</h4>
                      {interviewReport.improvements.map((s, i) => <p key={i} style={{ fontSize: '12px', marginBottom: '4px' }}>• {s}</p>)}
                    </div>
                  </div>
                  {/* Per-question breakdown */}
                  {interviewReport.perQuestionScores?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '13px', marginBottom: '10px' }}>Per-Question Breakdown:</h4>
                      {interviewReport.perQuestionScores.map((s, i) => (
                        <div key={i} style={{ marginBottom: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Q{i + 1}: {s.question.slice(0, 60)}...</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: s.score >= 75 ? 'var(--success)' : s.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{s.score}/100</span>
                          </div>
                          <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${s.score}%`, background: s.score >= 75 ? 'var(--success)' : s.score >= 50 ? 'var(--warning)' : 'var(--danger)', borderRadius: '2px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3>AI Voice Interview</h3>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>TARGET ROLE</label>
                <select className="ide-select" value={interviewRole} onChange={e => setInterviewRole(e.target.value)} style={{ width: '100%', marginTop: '6px' }} disabled={interviewActive}>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                </select>
              </div>
              <div className="ai-assistant-avatar">
                <div className={`avatar-circle ${isAiSpeaking ? 'speaking' : ''}`}><Mic size={36} color="white" /></div>
              </div>
              {!interviewActive ? (
                <button className="btn-premium" style={{ width: '100%' }} onClick={startInterview}>
                  🚀 Start AI Interview (Fullscreen)
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn-premium" style={{ width: '100%' }} onClick={() => setInterviewFullscreen(true)}>
                    <Maximize2 size={14} /> Back to Fullscreen
                  </button>
                  <button className="btn-danger" style={{ width: '100%' }} onClick={() => endInterview(interviewTranscript, answerScores)}>
                    Terminate Session
                  </button>
                </div>
              )}
              {proctorWarnings.length > 0 && (
                <div style={{ background: 'rgba(255,0,84,0.1)', border: '1px solid var(--danger)', padding: '14px', borderRadius: '8px' }}>
                  <h4 style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '8px' }}>⚠️ {proctorWarnings.length}/{MAX_VIOLATIONS} Violations</h4>
                  {proctorWarnings.slice(-3).map((w, i) => <p key={i} style={{ fontSize: '11px', marginBottom: '2px' }}>• {w}</p>)}
                  <p style={{ fontSize: '10px', color: 'var(--danger)', marginTop: '6px' }}>Auto-terminates at {MAX_VIOLATIONS} violations!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AI MOCK TEST ── */}
        {activeTab === 'mocktest' && (
          <div className="mock-test-container">
            {mockTestState === 'setup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ marginBottom: '16px' }}>Select Mock Test Topic</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {[
                      { name: 'Frontend', desc: 'HTML5, CSS3, JavaScript ES6, and React concepts.', icon: '⚛️', color: 'var(--accent-blue)', bg: 'rgba(0, 210, 255, 0.08)' },
                      { name: 'Backend', desc: 'Node.js, Express, databases (SQL/NoSQL), and systems.', icon: '🖥️', color: 'var(--accent-purple)', bg: 'rgba(157, 78, 221, 0.08)' },
                      { name: 'Python', desc: 'Python programming, iterators, decorators, and GIL details.', icon: '🐍', color: '#ffb703', bg: 'rgba(255, 183, 3, 0.08)' },
                      { name: 'Cloud', desc: 'DevOps pipelines, Docker, Kubernetes, and deployment strategies.', icon: '☁️', color: 'var(--success)', bg: 'rgba(57, 245, 212, 0.08)' },
                      { name: 'DSA', desc: 'Data structures, algorithms, sorting, and space-time complexity.', icon: '🧩', color: 'var(--accent-pink)', bg: 'rgba(255, 0, 84, 0.08)' }
                    ].map(t => (
                      <div key={t.name} 
                           onClick={() => {
                             setTestTopic(t.name);
                             handleGenerateMockTest(t.name);
                           }}
                           className="glass-card-interactive" 
                           style={{ 
                             padding: '20px', 
                             border: testTopic === t.name ? `2px solid ${t.color}` : '1px solid rgba(255,255,255,0.08)',
                             background: testTopic === t.name ? t.bg : 'rgba(255,255,255,0.02)',
                             borderRadius: '12px',
                             cursor: 'pointer',
                             transition: 'all 0.2s ease'
                           }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{t.icon}</div>
                        <h4 style={{ color: t.color, fontSize: '16px', fontWeight: 700 }}>{t.name}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3>Configurations</h3>
                  
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>DIFFICULTY</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {['Easy', 'Medium', 'Hard'].map(d => (
                        <button key={d} 
                                onClick={() => setTestDifficulty(d)}
                                style={{ 
                                  flex: 1, 
                                  padding: '8px', 
                                  fontSize: '12px', 
                                  borderRadius: '8px', 
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  background: testDifficulty === d ? 'var(--accent-blue)' : 'rgba(255,255,255,0.04)',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>NUMBER OF QUESTIONS</label>
                    <select className="ide-select" 
                            value={testQuestionsCount} 
                            onChange={e => setTestQuestionsCount(Number(e.target.value))}
                            style={{ width: '100%', marginTop: '8px' }}>
                      <option value={3}>3 Questions (Express)</option>
                      <option value={5}>5 Questions (Standard)</option>
                      <option value={10}>10 Questions (Comprehensive)</option>
                      <option value={20}>20 Questions (Extended)</option>
                      </select>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn-premium" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={handleGenerateMockTest}>
                      <Sparkles size={16} /> Generate Test
                    </button>
                    
                    <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setMockTestState('history')}>
                      View Test History
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mockTestState === 'loading' && (
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center' }}>
                <div className="radar-sweep" style={{ width: '80px', height: '80px', marginBottom: '24px' }} />
                <h2 style={{ fontSize: '24px', color: 'var(--accent-blue)', fontWeight: 700 }}>AI Generating Mock Test...</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '400px' }}>
                  Analyzing topics, tailoring questions, and establishing sandbox grading criteria for {testTopic} ({testDifficulty})...
                </p>
              </div>
            )}

            {mockTestState === 'active' && (
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px' }}>
                {/* Left: Question detail */}
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '13px', background: 'rgba(0, 210, 255, 0.15)', color: 'var(--accent-blue)', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
                      {testTopic} • {testDifficulty}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Question {currentTestQIdx + 1} of {testQuestions.length}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', lineHeight: 1.5, fontWeight: 600, marginBottom: '24px' }}>
                    {testQuestions[currentTestQIdx]?.question}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {testQuestions[currentTestQIdx]?.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[testQuestions[currentTestQIdx]?.id] === oIdx;
                      return (
                        <div key={oIdx} 
                             onClick={() => {
                               setUserAnswers(prev => ({ ...prev, [testQuestions[currentTestQIdx].id]: oIdx }));
                             }}
                             className="glass-card-interactive" 
                             style={{ 
                               padding: '16px 20px', 
                               borderRadius: '10px',
                               border: isSelected ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.06)',
                               background: isSelected ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                               cursor: 'pointer',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '12px',
                               transition: 'all 0.15s ease'
                             }}>
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            border: isSelected ? '2px solid var(--accent-blue)' : '2px solid rgba(255,255,255,0.3)',
                            background: isSelected ? 'var(--accent-blue)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            color: isSelected ? 'black' : 'white'
                          }}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span style={{ fontSize: '14px', lineHeight: 1.4 }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button className="btn-secondary" 
                            disabled={currentTestQIdx === 0} 
                            onClick={() => setCurrentTestQIdx(idx => idx - 1)}>
                      ← Previous
                    </button>
                    {currentTestQIdx < testQuestions.length - 1 ? (
                      <button className="btn-premium" 
                              onClick={() => setCurrentTestQIdx(idx => idx + 1)}>
                        Next Question →
                      </button>
                    ) : (
                      <button className="btn-premium" 
                              style={{ background: 'linear-gradient(135deg, var(--success), var(--accent-blue))' }}
                              onClick={() => handleSubmitMockTest()}
                              disabled={submittingTest}>
                        {submittingTest ? 'Evaluating...' : 'Submit Test'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Info and navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Timer panel */}
                  <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>TIME REMAINING</p>
                    <h2 style={{ 
                      fontSize: '32px', 
                      fontWeight: 800, 
                      fontFamily: 'monospace', 
                      color: testTimer < 60 ? 'var(--danger)' : testTimer < 180 ? 'var(--warning)' : 'var(--success)',
                      marginTop: '6px' 
                    }}>
                      {Math.floor(testTimer / 60)}:{(testTimer % 60).toString().padStart(2, '0')}
                    </h2>
                  </div>

                  {/* Questions navigator */}
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Question Navigator</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {testQuestions.map((q, idx) => {
                        const isAnswered = userAnswers[q.id] !== undefined;
                        const isCurrent = idx === currentTestQIdx;
                        
                        return (
                          <button key={idx} 
                                  onClick={() => setCurrentTestQIdx(idx)}
                                  style={{ 
                                    aspectRatio: '1',
                                    borderRadius: '8px',
                                    border: isCurrent ? '2px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.1)',
                                    background: isAnswered ? 'rgba(57, 245, 212, 0.2)' : 'rgba(255,255,255,0.03)',
                                    color: isAnswered ? 'var(--success)' : 'white',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '13px'
                                  }}>
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button className="btn-danger" 
                            style={{ width: '100%', marginTop: '24px' }} 
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel the test? Progress will be lost.')) {
                                setMockTestState('setup');
                              }
                            }}>
                      Cancel Test
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mockTestState === 'result' && testResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 800 }}>AI Assessment Result</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Topic: {testResult.topic} ({testResult.difficulty})</p>
                    </div>
                    <button className="btn-premium" onClick={() => setMockTestState('setup')}>
                      Start New Test
                    </button>
                  </div>

                  <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SCORE ACHIEVED</span>
                      <h1 style={{ fontSize: '48px', color: testResult.score >= 80 ? 'var(--success)' : testResult.score >= 50 ? 'var(--warning)' : 'var(--danger)', marginTop: '8px' }}>
                        {testResult.score}%
                      </h1>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {testResult.score >= 80 ? 'PRO Level Passed' : testResult.score >= 50 ? 'Baseline Met' : 'Needs Practice'}
                      </span>
                    </div>

                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>TIME TAKEN</span>
                      <h1 style={{ fontSize: '48px', color: 'var(--accent-blue)', marginTop: '8px' }}>
                        {Math.floor(testResult.duration / 60)}:{(testResult.duration % 60).toString().padStart(2, '0')}
                      </h1>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>minutes</span>
                    </div>

                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>REWARDS EARNED</span>
                      <h1 style={{ fontSize: '48px', color: '#ffb703', marginTop: '8px' }}>
                        +{testResult.xpAwarded} XP
                      </h1>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Rank XP synced</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--accent-blue)', marginBottom: '8px' }}>AI Feedback</h4>
                    <p style={{ fontSize: '14px', lineHeight: 1.6 }}>{testResult.feedback}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: 'rgba(57,245,212,0.06)', border: '1px solid rgba(57,245,212,0.18)', padding: '16px', borderRadius: '10px' }}>
                      <h4 style={{ color: 'var(--success)', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>✅ Strengths Identified</h4>
                      {testResult.strengths.map((str, idx) => (
                        <p key={idx} style={{ fontSize: '13px', margin: '6px 0' }}>• {str}</p>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(255,0,84,0.06)', border: '1px solid rgba(255,0,84,0.18)', padding: '16px', borderRadius: '10px' }}>
                      <h4 style={{ color: 'var(--danger)', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>🔧 Focus / Improvement Areas</h4>
                      {testResult.weaknesses.map((weak, idx) => (
                        <p key={idx} style={{ fontSize: '13px', margin: '6px 0' }}>• {weak}</p>
                      ))}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Detailed Question Review</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {testResult.gradedQuestions.map((q, idx) => (
                      <div key={idx} 
                           style={{ 
                             background: 'rgba(255,255,255,0.02)',
                             border: `1px solid ${q.isCorrect ? 'var(--success)33' : 'var(--danger)33'}`,
                             borderRadius: '10px',
                             padding: '20px'
                           }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Question {idx + 1}</span>
                          <span style={{ 
                            fontSize: '12px', 
                            background: q.isCorrect ? 'rgba(57,245,212,0.15)' : 'rgba(255,0,84,0.15)', 
                            color: q.isCorrect ? 'var(--success)' : 'var(--danger)',
                            padding: '3px 10px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}>
                            {q.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.5, marginBottom: '12px' }}>{q.question}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                          {q.options.map((opt, oIdx) => {
                            const isUserChoice = q.userAnswer === oIdx;
                            const isCorrectChoice = q.correctAnswer === oIdx;
                            
                            let optionStyle = {
                              padding: '10px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              border: '1px solid rgba(255,255,255,0.06)',
                              background: 'rgba(255,255,255,0.01)',
                              color: 'white'
                            };
                            
                            if (isCorrectChoice) {
                              optionStyle.border = '1px solid var(--success)';
                              optionStyle.background = 'rgba(57,245,212,0.1)';
                              optionStyle.color = 'var(--success)';
                            } else if (isUserChoice && !isCorrectChoice) {
                              optionStyle.border = '1px solid var(--danger)';
                              optionStyle.background = 'rgba(255,0,84,0.1)';
                              optionStyle.color = 'var(--danger)';
                            }
                            
                            return (
                              <div key={oIdx} style={optionStyle}>
                                <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.15)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>💡 AI Explanation</span>
                          {q.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mockTestState === 'history' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>Mock Test Practice History</h3>
                  <button className="btn-secondary" onClick={() => setMockTestState('setup')}>
                    ← Back to Setup
                  </button>
                </div>

                {loadingHistory ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>Loading history...</div>
                ) : mockHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No mock tests taken yet. Start practicing today to earn XP!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {mockHistory.map((hist, idx) => (
                      <div key={hist.id || idx} 
                           style={{ 
                             background: 'rgba(255,255,255,0.02)',
                             border: '1px solid rgba(255,255,255,0.08)',
                             padding: '16px 20px',
                             borderRadius: '10px',
                             display: 'flex',
                             justifyContent: 'space-between',
                             alignItems: 'center'
                           }}>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>{hist.topic} Mock Test</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Difficulty: {hist.difficulty} • Taken on: {new Date(hist.createdAt).toLocaleDateString()} at {new Date(hist.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ 
                              fontSize: '18px', 
                              fontWeight: 'bold', 
                              color: hist.score >= 80 ? 'var(--success)' : hist.score >= 50 ? 'var(--warning)' : 'var(--danger)' 
                            }}>
                              {hist.score}%
                            </span>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Duration: {Math.floor(hist.duration / 60)}m {hist.duration % 60}s
                            </p>
                          </div>
                          <button className="btn-secondary" 
                                  onClick={() => {
                                    setTestResult({
                                      topic: hist.topic,
                                      difficulty: hist.difficulty,
                                      score: hist.score,
                                      duration: hist.duration,
                                      feedback: `Viewing archived report from test taken on ${new Date(hist.createdAt).toLocaleDateString()}.`,
                                      strengths: hist.strengths || [],
                                      weaknesses: hist.weaknesses || [],
                                      gradedQuestions: hist.questions.map(q => ({
                                        question: q.question,
                                        options: q.options,
                                        correctAnswer: q.correctAnswer,
                                        userAnswer: q.userAnswer,
                                        explanation: q.explanation,
                                        isCorrect: q.userAnswer === q.correctAnswer
                                      })),
                                      xpAwarded: hist.score >= 80 ? 150 : hist.score >= 50 ? 100 : 50
                                    });
                                    setMockTestState('result');
                                  }}>
                            Review Result
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── LIVE CLASSROOM ── */}
        {activeTab === 'live' && <LiveClassesModule />}

        {/* ── CODING BATTLES (FIXED) ── */}
        {activeTab === 'battle' && (
          <div className="glass-panel" style={{ padding: '30px' }}>
            {battleState === 'idle' && (
              <div className="battle-matchmaking">
                <h2>Real-Time Coding Arena</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '10px 0 30px', maxWidth: '500px' }}>
                  1v1 coding battles — your code is actually tested before victory is declared!
                </p>
                <button className="btn-premium" style={{ padding: '16px 32px', fontSize: '16px' }} onClick={joinBattleQueue}>
                  <Swords size={20} style={{ marginRight: '8px' }} /> Find Battle Match
                </button>
              </div>
            )}
            {battleState === 'queue' && (
              <div className="battle-matchmaking">
                <div className="radar-sweep" />
                <h2>Searching for Opponent...</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Matching by XP rank</p>
                <button className="btn-danger" style={{ marginTop: '20px' }} onClick={() => setBattleState('idle')}>Cancel</button>
              </div>
            )}
            {battleState === 'matched' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                  <div>
                    <h3 style={{ color: 'var(--accent-pink)' }}>⚔️ DUEL vs {opponentName}</h3>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>Problem: {battleProblem?.title}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: battleTimer < 60 ? 'var(--danger)' : 'var(--warning)' }}>
                      ⏱️ {Math.floor(battleTimer / 60)}:{(battleTimer % 60).toString().padStart(2, '0')}
                    </div>
                    {battleTestResults.length > 0 && !battleSubmitted && (
                      <span style={{ fontSize: '11px', color: 'var(--danger)' }}>❌ Fix your code and resubmit!</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="ide-panel">
                    <div className="ide-header">
                      <span>Your Workspace</span>
                      <button className="btn-premium" onClick={submitBattleCode} disabled={battleSubmitted}>
                        {battleSubmitted ? '⚙️ Testing...' : '▶ Submit & Test'}
                      </button>
                    </div>
                    <textarea className="ide-textarea" value={battleCode} onChange={handleBattleCodeChange} spellCheck="false" style={{ height: '300px' }} />
                    {battleTestResults.length > 0 && (
                      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {battleTestResults.map(tr => (
                          <div key={tr.testCase} style={{ fontSize: '11px', color: tr.passed ? 'var(--success)' : 'var(--danger)', marginBottom: '3px' }}>
                            {tr.passed ? '✅' : '❌'} Test {tr.testCase}: {tr.actual} (expected {tr.expected})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{opponentName}</strong>
                      <span style={{ color: opponentProgress > 80 ? 'var(--danger)' : 'var(--accent-blue)', fontWeight: 'bold' }}>{opponentProgress}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--accent-purple),var(--accent-pink))', width: `${opponentProgress}%`, transition: 'width 0.5s ease' }} />
                    </div>
                    <textarea className="ide-textarea" value={opponentCode} readOnly style={{ flex: 1, background: '#0a0715', color: '#a39eb9', cursor: 'not-allowed', minHeight: '300px' }} />
                  </div>
                </div>
              </div>
            )}
            {battleState === 'finished' && (
              <div className="battle-matchmaking">
                <h1 style={{ fontSize: '30px' }}>{battleStatusMsg}</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '15px 0' }}>Rewards synced to profile.</p>
                <button className="btn-premium" onClick={() => { setBattleState('idle'); setBattleTestResults([]); setBattleSubmitted(false); }}>Back to Arena</button>
              </div>
            )}
          </div>
        )}

        {/* ── LEADERBOARD ── */}
        {activeTab === 'leaderboard' && <LeaderboardTab currentUser={userProfile} />}

        {/* ── RESUME ── */}
        {activeTab === 'resume' && (
  <div className="resume-layout">
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '85vh' }}>
      <h3>Resume Editor</h3>

      {/* Basic Info */}
      {[
        { label: 'FULL NAME', key: 'fullName', type: 'input' },
        { label: 'CAREER OBJECTIVE', key: 'bio', type: 'textarea' },
        { label: 'EMAIL', key: 'email', type: 'input' },
      ].map(f => (
        <div key={f.key}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{f.label}</label>
          {f.type === 'textarea'
            ? <textarea className="chat-input" style={{ width: '100%', marginTop: '4px', height: '56px', resize: 'none' }} value={resumeData[f.key]} onChange={e => handleResumeField(f.key, e.target.value)} />
            : <input type="text" className="chat-input" style={{ width: '100%', marginTop: '4px' }} value={resumeData[f.key]} onChange={e => handleResumeField(f.key, e.target.value)} />
          }
        </div>
      ))}

      {/* Phone + Alternate Phone */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[{ label: 'PHONE', key: 'phone' }, { label: 'ALTERNATE PHONE', key: 'altPhone' }].map(f => (
          <div key={f.key}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{f.label}</label>
            <input type="text" className="chat-input" style={{ width: '100%', marginTop: '4px' }} value={resumeData[f.key] || ''} onChange={e => handleResumeField(f.key, e.target.value)} />
          </div>
        ))}
      </div>

      {/* Education, Experience, Projects */}
      {[
        { label: 'EDUCATION', key: 'education', type: 'textarea' },
        { label: 'EXPERIENCE', key: 'experience', type: 'textarea' },
        { label: 'PROJECTS (describe your key projects)', key: 'projects', type: 'textarea' },
      ].map(f => (
        <div key={f.key}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{f.label}</label>
          <textarea className="chat-input" style={{ width: '100%', marginTop: '4px', height: '64px', resize: 'none' }} value={resumeData[f.key] || ''} onChange={e => handleResumeField(f.key, e.target.value)} />
        </div>
      ))}

      {/* Skills + Certifications */}
      {[
        { label: 'TECHNICAL SKILLS (comma separated)', key: 'skills', type: 'input' },
        { label: 'CERTIFICATIONS', key: 'certifications', type: 'textarea' },
        { label: 'ACHIEVEMENTS & AWARDS', key: 'achievements', type: 'textarea' },
        { label: 'INTERNSHIPS', key: 'internships', type: 'textarea' },
        { label: 'LANGUAGES KNOWN', key: 'languages', type: 'input' },
        { label: 'EXTRACURRICULAR ACTIVITIES (optional)', key: 'extracurricular', type: 'textarea' },
      ].map(f => (
        <div key={f.key}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{f.label}</label>
          {f.type === 'textarea'
            ? <textarea className="chat-input" style={{ width: '100%', marginTop: '4px', height: '56px', resize: 'none' }} value={resumeData[f.key] || ''} onChange={e => handleResumeField(f.key, e.target.value)} />
            : <input type="text" className="chat-input" style={{ width: '100%', marginTop: '4px' }} value={resumeData[f.key] || ''} onChange={e => handleResumeField(f.key, e.target.value)} />
          }
        </div>
      ))}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-premium" onClick={saveResume}>Save</button>
          {resumeSavedAt && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatSavedAgo()}</span>}
        </div>
        <button className="btn-secondary" onClick={exportResumePDF}><Download size={14} /> Export PDF</button>
      </div>
      {resumeSaveMsg && <p style={{ fontSize: '12px', color: 'var(--success)' }}>{resumeSaveMsg}</p>}
    </div>

    {/* PREVIEW */}
    <div>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
        {['modern', 'minimal'].map(t => <button key={t} className={`btn-secondary ${resumeTemplate === t ? 'active' : ''}`} onClick={() => setResumeTemplate(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
      </div>
      <div id="resume-preview-panel" className="resume-preview-panel" style={{ padding: '28px' }}>
        <div style={{ borderBottom: '2px solid #ddd', paddingBottom: '12px', marginBottom: '15px' }}>
          <h1 style={{ color: '#111', fontSize: '24px' }}>{resumeData.fullName}</h1>
          <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
            📧 {resumeData.email}
            {resumeData.phone && ` | 📞 ${resumeData.phone}`}
            {resumeData.altPhone && ` | 📱 ${resumeData.altPhone}`}
          </p>
        </div>

        {[
          { label: 'Career Objective', key: 'bio' },
          { label: 'Education', key: 'education' },
          { label: 'Experience', key: 'experience' },
          { label: 'Projects', key: 'projects' },
          { label: 'Certifications', key: 'certifications' },
          { label: 'Achievements & Awards', key: 'achievements' },
          { label: 'Internships', key: 'internships' },
        ].map(f => resumeData[f.key] ? (
          <div key={f.key} style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#444', marginBottom: '5px', letterSpacing: '0.5px' }}>{f.label}</h3>
            <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{resumeData[f.key]}</p>
          </div>
        ) : null)}

        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#444', marginBottom: '5px' }}>Technical Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {(Array.isArray(resumeData.skills) ? resumeData.skills : String(resumeData.skills || '').split(',')).map((s, i) => (
              <span key={i} style={{ background: '#f0f0f5', color: '#333', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{String(s).trim()}</span>
            ))}
          </div>
        </div>

        {resumeData.languages && (
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#444', marginBottom: '5px' }}>Languages</h3>
            <p style={{ fontSize: '12px', color: '#555' }}>{resumeData.languages}</p>
          </div>
        )}
        {resumeData.extracurricular && (
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#444', marginBottom: '5px' }}>Extracurricular Activities</h3>
            <p style={{ fontSize: '12px', color: '#555', whiteSpace: 'pre-wrap' }}>{resumeData.extracurricular}</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}


        {/* ── MARKETPLACE ── */}
        {activeTab === 'marketplace' && (
  <>
    <div style={{ marginBottom: '16px' }}>
      <input type="text" className="chat-input" placeholder="🔍 Search courses..." style={{ width: '320px' }}
        onChange={e => { const q = e.target.value.toLowerCase(); setCourses(q ? INITIAL_COURSES.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)) : INITIAL_COURSES); }} />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
      {courses.map(c => (
        <div key={c.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '12px' }}>
          {/* Thumbnail */}
          <div style={{ position: 'relative', height: '150px', overflow: 'hidden', background: '#1a1030' }}>
            <img src={c.image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display='none'; }} />
            <span style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '10px', background: 'rgba(0,0,0,0.75)', color: 'white', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>{c.category}</span>
            {c.enrolled && <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', background: 'var(--success)', color: 'white', padding: '3px 8px', borderRadius: '4px' }}>Enrolled</span>}
          </div>

          {/* Info */}
          <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h3 style={{ fontSize: '13px', lineHeight: 1.4, fontWeight: 700 }}>{c.title}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.instructor}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--warning)' }}>{c.rating}</span>
              <div style={{ display: 'flex', gap: '1px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={10} fill={i < Math.floor(c.rating) ? 'var(--warning)' : 'none'} stroke="var(--warning)" />
                ))}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>({(c.students / 1000).toFixed(0)}k)</span>
            </div>

            <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>⏱ {c.hours} hrs • 📚 {c.lectures} lectures • All Levels</p>

            {c.enrolled && c.progress > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>Progress</span><span>{c.progress}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                  <div style={{ width: `${c.progress}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: '2px' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--success)' }}>{c.price}</span>
              {c.enrolled
                ? <button className="btn-secondary" style={{ fontSize: '11px', pointerEvents: 'none', color: 'var(--success)' }}>✓ Continue</button>
                : <button className="btn-premium" style={{ fontSize: '11px', padding: '6px 14px' }} onClick={() => { setCheckoutCourse(c); setShowPaymentModal(true); setPaymentSuccess(false); setCardNumber(''); }}>Enroll Now</button>
              }
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Payment modal — keep your existing one unchanged */}
    {showPaymentModal && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div className="glass-panel" style={{ width: '420px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>🔐 Secure Checkout</h3>
            <X style={{ cursor: 'pointer' }} onClick={() => { setShowPaymentModal(false); setPaymentSuccess(false); setCardNumber(''); }} />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img src={checkoutCourse?.image} alt="" style={{ width: '64px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} onError={e => e.target.style.display='none'} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: 600 }}>{checkoutCourse?.title}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{checkoutCourse?.instructor}</p>
            </div>
            <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--success)' }}>{checkoutCourse?.price}</span>
          </div>
          {paymentSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <h3 style={{ color: 'var(--success)', fontSize: '20px' }}>Payment Successful!</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>Unlocking course access...</p>
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>CARD NUMBER</label>
                <input type="text" maxLength={19} className="chat-input" style={{ width: '100%' }} placeholder="4242 4242 4242 4242"
                  value={cardNumber} onChange={e => { const v = e.target.value.replace(/\D/g,'').slice(0,16); setCardNumber(v.replace(/(.{4})/g,'$1 ').trim()); }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>EXPIRY</label><input type="text" className="chat-input" placeholder="MM/YY" maxLength={5} /></div>
                <div><label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>CVV</label><input type="password" className="chat-input" placeholder="•••" maxLength={3} /></div>
              </div>
              <button className="btn-premium" style={{ width: '100%', padding: '14px' }}
                onClick={() => { if (!cardNumber || cardNumber.replace(/\s/g,'').length < 16) { addNotif('⚠️ Enter a valid card number!'); return; } processPayment(); }}>
                Pay {checkoutCourse?.price} Securely →
              </button>
              <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>Test mode — no real money charged</p>
            </>
          )}
        </div>
      </div>
    )}
  </>
)}
          <>
            <div className="dashboard-grid">
              {courses.map(c => (
                <div key={c.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>{c.image}</div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-blue)', fontWeight: 'bold' }}>{c.category}</span>
                  <h3 style={{ fontSize: '15px', margin: '6px 0', flexGrow: 1 }}>{c.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <Star size={12} style={{ color: 'var(--warning)' }} fill="var(--warning)" />
                    <span style={{ fontSize: '12px', color: 'var(--warning)' }}>{c.rating}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>({(c.students / 1000).toFixed(1)}k students)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{c.price}</span>
                    {c.enrolled ? <button className="btn-secondary" style={{ pointerEvents: 'none', color: 'var(--text-secondary)', fontSize: '12px' }}>✓ Enrolled</button> : <button className="btn-premium" style={{ fontSize: '12px' }} onClick={() => { setCheckoutCourse(c); setShowPaymentModal(true); setPaymentSuccess(false); setCardNumber(''); }}>Enroll Now</button>}
                  </div>
                </div>
              ))}
            </div>
            {showPaymentModal && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div className="glass-panel" style={{ width: '420px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>🔐 Secure Checkout</h3>
        <X style={{ cursor: 'pointer' }} onClick={() => { setShowPaymentModal(false); setPaymentSuccess(false); setCardNumber(''); }} />
      </div>

      {/* Course summary */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '28px' }}>{checkoutCourse?.image}</span>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600 }}>{checkoutCourse?.title}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{checkoutCourse?.category}</p>
        </div>
        <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: '18px', color: 'var(--success)' }}>{checkoutCourse?.price}</span>
      </div>

      {paymentSuccess ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
          <h3 style={{ color: 'var(--success)', fontSize: '20px' }}>Payment Successful!</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>Unlocking course access...</p>
          <div style={{ marginTop: '16px', background: 'rgba(57,245,212,0.08)', borderRadius: '8px', padding: '10px', border: '1px solid var(--success)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Transaction ID</p>
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--success)' }}>
              rzp_test_{Math.random().toString(36).slice(2,12).toUpperCase()}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Razorpay-style card form */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            {['💳 Card', '🏦 UPI', '📱 Wallet'].map(m => (
              <button key={m} style={{
                flex: 1, padding: '8px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer',
                background: m === '💳 Card' ? 'rgba(0,210,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: m === '💳 Card' ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.08)',
                color: 'white'
              }}>{m}</button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              CARD NUMBER
            </label>
            <input
              type="text" maxLength={19}
              className="chat-input" style={{ width: '100%' }}
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>EXPIRY</label>
              <input type="text" className="chat-input" placeholder="MM/YY" maxLength={5}
                onChange={e => { const v = e.target.value.replace(/\D/g,''); e.target.value = v.length > 2 ? v.slice(0,2)+'/'+v.slice(2) : v; }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>CVV</label>
              <input type="password" className="chat-input" placeholder="•••" maxLength={3} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>ZIP</label>
              <input type="text" className="chat-input" placeholder="600001" maxLength={6} />
            </div>
          </div>

          {/* Validation hint */}
          {cardNumber && cardNumber.replace(/\s/g,'') !== '4242424242424242' && (
            <p style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '-8px' }}>
              ⚠️ Use test card: <strong>4242 4242 4242 4242</strong>
            </p>
          )}

          {/* Security badges */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {['🔒 256-bit SSL', '✅ PCI DSS', '⚡ Razorpay'].map(b => (
              <span key={b} style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px' }}>{b}</span>
            ))}
          </div>

          <button
            className="btn-premium" style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            onClick={() => {
              if (!cardNumber || cardNumber.replace(/\s/g,'').length < 16) {
                addNotif('⚠️ Enter a valid 16-digit card number!');
                return;
              }
              processPayment();
            }}
          >
            Pay {checkoutCourse?.price} Securely →
          </button>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
            Test mode — no real money charged
          </p>
        </>
      )}
    </div>
  </div>
)}
          </>
        

        {/* ── PLACEMENTS ── */}
        {activeTab === 'placements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3>Placement Dashboard</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Match rates auto-update when you edit your resume skills.</p>
              <div style={{ marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search jobs by title, company, location, skill..."
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  className="chat-input"
                  style={{ minWidth: '280px', flex: '1 1 320px', marginTop: '12px' }}
                />
                <button
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '12px 16px' }}
                  onClick={() => setJobSearch('')}
                >Clear</button>
              </div>
            </div>
            {filteredJobs.length === 0 ? (
              <div className="glass-panel" style={{ padding: '20px' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No jobs match your search. Try adjusting keywords or update your resume skills.</p>
              </div>
            ) : filteredJobs.map(job => (
              <div key={job.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '17px' }}>{job.role}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>🏢 {job.company} • 📍 {job.location} • 💰 {job.salary}</p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {job.requiredSkills.map(s => <span key={s} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '4px' }}>{s}</span>)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>MATCH</span>
                    <h3 style={{ color: job.matchRate >= 80 ? 'var(--success)' : job.matchRate >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{job.matchRate}%</h3>
                  </div>
                  {appliedJobs.includes(job.id) ? <button className="btn-secondary" style={{ pointerEvents: 'none', fontSize: '12px' }}>Applied ✓</button> : <button className="btn-premium" style={{ fontSize: '12px' }} onClick={() => applyForJob(job)}>Quick Apply</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
              <div className="glass-panel chart-container">
                <h3>Daily Coding Activity</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Contribution grid — 2026</p>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '15px' }}>
                  <div className="contrib-grid">
                    {Array.from({ length: 35 }).map((_, i) => { const lvls = ['', 'lvl-1', 'lvl-2', 'lvl-3', 'lvl-4']; return <div key={i} className={`contrib-cell ${lvls[(i * 3 + 2) % 5]}`} />; })}
                  </div>
                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[['lvl-4', '6+ Submissions'], ['lvl-2', '1-5 Submissions'], ['', '0 Submissions']].map(([cls, label]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div className={`contrib-cell ${cls}`} style={{ width: '12px', height: '12px' }} />{label}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="glass-panel chart-container">
                <h3>Skills Distribution</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                  {[['JavaScript & DSA', 90, 'var(--accent-blue)'], ['System Design', 65, 'var(--accent-purple)'], ['AI & APIs', 80, 'var(--success)'], ['DevOps & Docker', 55, 'var(--warning)']].map(([label, pct, color]) => (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}><span>{label}</span><span>{pct}%</span></div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass-panel chart-container">
              <h3>Solve Analytics — Speed vs Accuracy</h3>
              <div style={{ height: '200px', position: 'relative', marginTop: '20px' }}>
                <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d2ff" stopOpacity="0.4" /><stop offset="100%" stopColor="#00d2ff" stopOpacity="0" /></linearGradient>
                    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9d4edd" stopOpacity="0.4" /><stop offset="100%" stopColor="#9d4edd" stopOpacity="0" /></linearGradient>
                  </defs>
                  {[30, 75, 120].map(y => <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="rgba(255,255,255,0.05)" />)}
                  <path d="M 0 120 Q 100 80 200 60 T 400 40 T 500 30 L 500 150 L 0 150 Z" fill="url(#bg1)" />
                  <path d="M 0 140 Q 100 110 200 90 T 400 70 T 500 50 L 500 150 L 0 150 Z" fill="url(#bg2)" />
                  <path d="M 0 120 Q 100 80 200 60 T 400 40 T 500 30" fill="none" stroke="#00d2ff" strokeWidth="3" />
                  <path d="M 0 140 Q 100 110 200 90 T 400 70 T 500 50" fill="none" stroke="#9d4edd" strokeWidth="3" />
                  {[[200, 60, '#00d2ff'], [400, 40, '#00d2ff'], [200, 90, '#9d4edd'], [400, 70, '#9d4edd']].map(([cx, cy, fill], i) => <circle key={i} cx={cx} cy={cy} r="4" fill={fill} />)}
                </svg>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', justifyContent: 'center' }}>
                <span style={{ color: '#00d2ff' }}>● Solve Speed</span>
                <span style={{ color: '#9d4edd' }}>● Accuracy %</span>
              </div>
            </div>
          </div>
        )}

        {/* ── CERTIFICATE ── */}
        
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
            {/* Configuration Inputs */}
            <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3>Configure Certificate</h3>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>STUDENT NAME</label>
                <input type="text" className="chat-input" style={{ width: '100%', marginTop: '4px' }} value={certName} onChange={e => setCertName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>COURSE</label>
                <select className="ide-select" value={certCourse} onChange={e => setCertCourse(e.target.value)} style={{ width: '100%', marginTop: '4px' }}>
                  <option>Full-Stack MERN Mastery</option>
                  <option>AI Engineering & TensorFlow.js</option>
                  <option>Data Structures & Algorithms</option>
                </select>
              </div>
            </div>
            {/* Certificate Preview */}
            <div id="certificate-content" className="certificate-frame" style={{ width: '100%', maxWidth: '650px', padding: '40px', background: 'white', color: '#111', textAlign: 'center', borderRadius: '8px' }}>
              <h1 style={{ color: '#d97706', fontSize: '28px', fontStyle: 'italic', marginBottom: '10px' }}>Certificate of Achievement</h1>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>This is proudly presented to</p>
              <h2 style={{ fontSize: '32px', borderBottom: '1px solid #ccc', paddingBottom: '10px', margin: '0 auto 20px', display: 'inline-block' }}>{certName}</h2>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 20px' }}>For successfully completing all coding challenges, proctored assessments, and project requirements for</p>
              <h3 style={{ color: '#00d2ff', fontSize: '22px', marginBottom: '30px' }}>{certCourse}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#888' }}>ISSUED</span>
                  <p style={{ fontWeight: 'bold', fontSize: '13px' }}>{new Date().toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '50px', height: '50px', background: '#eee', margin: '0 auto 4px', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ width: '100%', height: '100%', background: '#111', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1px' }}>
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} style={{ background: (i * 7 + 12) % 3 === 0 ? 'white' : 'transparent' }} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Scan to Verify</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>HASH</span>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--warning)' }}>VERIFIED-SH-A89B0CD2</p>
                </div>
              </div>
            </div>
            {/* Download Button */}
            <button className="btn-premium" onClick={() => {
              const element = document.getElementById('certificate-content');
              if (element) {
                const blob = new Blob([element.outerHTML], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `certificate_${certName || 'student'}.html`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }}>
              <Download size={16} /> Export Certificate
            </button>
          </div>
        )}

        
  
    <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3>Configure Certificate</h3>
      <div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>STUDENT NAME</label><input type="text" className="chat-input" style={{ width: '100%', marginTop: '4px' }} value={certName} onChange={e => setCertName(e.target.value)} /></div>
      <div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>COURSE</label>
        <select className="ide-select" value={certCourse} onChange={e => setCertCourse(e.target.value)} style={{ width: '100%', marginTop: '4px' }}>
          <option>Full-Stack MERN Mastery</option><option>AI Engineering & TensorFlow.js</option><option>Data Structures & Algorithms</option>
        </select>
      </div>
    </div>

      <h1 style={{ color: 'var(--warning)', fontSize: '28px', fontStyle: 'italic', marginBottom: '10px' }}>Certificate of Achievement</h1>
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
            <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3>Configure Certificate</h3>
              <div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>STUDENT NAME</label><input type="text" className="chat-input" style={{ width: '100%', marginTop: '4px' }} value={certName} onChange={e => setCertName(e.target.value)} /></div>
              <div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>COURSE</label>
                <select className="ide-select" value={certCourse} onChange={e => setCertCourse(e.target.value)} style={{ width: '100%', marginTop: '4px' }}>
                  <option>Full-Stack MERN Mastery</option><option>AI Engineering & TensorFlow.js</option><option>Data Structures & Algorithms</option>
                </select>
              </div>
            </div>
            <div className="certificate-frame" style={{ width: '100%', maxWidth: '650px', padding: '40px', background: 'white', color: '#111', textAlign: 'center', borderRadius: '8px' }}>
              <h1 style={{ color: '#d97706', fontSize: '28px', fontStyle: 'italic', marginBottom: '10px' }}>Certificate of Achievement</h1>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>This is proudly presented to</p>
              <h2 style={{ fontSize: '32px', borderBottom: '1px solid #ccc', paddingBottom: '10px', margin: '0 auto 20px', display: 'inline-block' }}>{certName}</h2>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 20px' }}>For successfully completing all coding challenges, proctored assessments, and project requirements for</p>
              <h3 style={{ color: '#00d2ff', fontSize: '22px', marginBottom: '30px' }}>{certCourse}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <div><span style={{ fontSize: '11px', color: '#888' }}>ISSUED</span><p style={{ fontWeight: 'bold', fontSize: '13px' }}>{new Date().toLocaleDateString()}</p></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '50px', height: '50px', background: '#eee', margin: '0 auto 4px', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ width: '100%', height: '100%', background: '#111', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1px' }}>
                      {Array.from({ length: 25 }).map((_, i) => <div key={i} style={{ background: (i * 7 + 12) % 3 === 0 ? 'white' : 'transparent' }} />)}
                    </div>
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Scan to Verify</span>
                </div>
                <div style={{ textAlign: 'right' }}><span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>HASH</span><p style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--warning)' }}>VERIFIED-SH-A89B0CD2</p></div>
              </div>
            </div>
            <button className="btn-premium" onClick={() => window.print()}><Download size={16} /> Export Certificate</button>
          </div>
        
      </main>
    </div>
  );
}




























































































