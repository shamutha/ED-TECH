import React, { useState, useRef, useEffect } from 'react';
import {
  Video, Sparkles, CheckCircle, Send, Trash2, Bell, Users,
  Calendar, Clock, Link2, FileText, DownloadCloud, Award,
  BarChart3, Plus, Settings
} from 'lucide-react';

/**
 * ENHANCED LIVE CLASSES & WEBINARS MODULE
 * Features: Create Classes | Join Classes | Attendance | Recordings | Class Notes
 *           Webinars | Q&A | Polls | Certificates | Analytics
 */

export default function LiveClassesModule() {
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatListRef = useRef(null);
  const chatMountedRef = useRef(false);

  // STATE: Drawing
  const [drawingColor, setDrawingColor] = useState('#00d2ff');
  const [penSize, setPenSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // STATE: Chat & Communication
  const [webinarMessages, setWebinarMessages] = useState([
    { sender: 'Instructor', text: "Welcome everyone! Let's start with architecture patterns.", time: '09:00 AM' },
    { sender: 'Alice', text: "What's the best pattern for microservices?", time: '09:02 AM' },
    { sender: 'Instructor', text: "Great question! Let's discuss event-driven architecture.", time: '09:03 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // STATE: Polls & Q&A
  const [activeTab, setActiveTab] = useState('live-classes');
  const [currentPoll, setCurrentPoll] = useState({
    question: 'Which architecture pattern is most scalable?',
    options: [
      { text: 'Monolith', votes: 23 },
      { text: 'Microservices', votes: 156 },
      { text: 'Serverless', votes: 89 },
      { text: 'Hybrid', votes: 42 }
    ],
    totalVotes: 310
  });
  const [userVoted, setUserVoted] = useState(false);

  // STATE: Schedule-a-class form
  const [newClass, setNewClass] = useState({ title: '', dateTime: '', duration: '', meetLink: '', description: '' });
  const [scheduleMsg, setScheduleMsg] = useState('');

  // STATE: Live Classes & Webinars data
  const [liveClasses, setLiveClasses] = useState([
    {
      id: 1,
      title: 'MERN Scalability & Performance',
      instructor: 'Prof. Shamutha AI',
      students: 247,
      status: 'live',
      startTime: '09:00 AM',
      duration: '90 min',
      meetLink: 'https://meet.google.com/abc-xyz-123',
      attendanceRate: 92,
      recordingAvailable: false
    },
    {
      id: 2,
      title: 'Advanced DSA: Binary Trees',
      instructor: 'Dr. Rajesh Kumar',
      students: 165,
      status: 'live',
      startTime: '10:00 AM',
      duration: '60 min',
      meetLink: 'https://meet.google.com/def-ghi-456',
      attendanceRate: 88,
      recordingAvailable: false
    },
    {
      id: 3,
      title: 'React Server Components Explained',
      instructor: 'Emma Johnson',
      students: 0,
      status: 'upcoming',
      startTime: 'Today, 2:15 PM',
      duration: '75 min',
      meetLink: null,
      attendanceRate: 0,
      recordingAvailable: false
    }
  ]);

  // Schedule a new live class from the "Create New Live Class" form
  const handleScheduleClass = () => {
    if (!newClass.title.trim()) {
      setScheduleMsg('⚠️ Please enter a class title.');
      return;
    }

    // Format the chosen date/time into a friendly label (falls back to "Upcoming")
    let startTime = 'Upcoming';
    if (newClass.dateTime) {
      const d = new Date(newClass.dateTime);
      if (!isNaN(d)) {
        startTime = d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    }

    const scheduled = {
      id: Date.now(),
      title: newClass.title.trim(),
      instructor: 'You (Host)',
      students: 0,
      status: 'upcoming',
      startTime,
      duration: newClass.duration ? `${newClass.duration} min` : '60 min',
      meetLink: newClass.meetLink.trim() || null,
      description: newClass.description.trim(),
      attendanceRate: 0,
      recordingAvailable: false
    };

    setLiveClasses(prev => [scheduled, ...prev]);
    setNewClass({ title: '', dateTime: '', duration: '', meetLink: '', description: '' });
    setScheduleMsg(`✅ "${scheduled.title}" scheduled for ${startTime}.`);
  };

  const [webinars] = useState([
    {
      id: 1,
      title: 'Cloud Architecture at Scale: Google SRE Practices',
      speaker: 'Sarah Chen, Google',
      registered: 1240,
      features: ['Q&A', 'Polls', 'Certificate', 'Recording'],
      date: 'Mar 25, 2026',
      time: '6:00 PM IST'
    },
    {
      id: 2,
      title: 'Building AI Products: From Concept to Production',
      speaker: 'Dr. Arun Patel, OpenAI',
      registered: 2180,
      features: ['Q&A', 'Polls', 'Certificate'],
      date: 'Mar 28, 2026',
      time: '7:00 PM IST'
    },
    {
      id: 3,
      title: 'System Design Interview Masterclass',
      speaker: 'Rahul Sharma, Tech Lead',
      registered: 3450,
      features: ['Q&A', 'Polls', 'Certificate', 'Recording'],
      date: 'Apr 01, 2026',
      time: '5:00 PM IST'
    }
  ]);

  const [resources] = useState([
    { type: 'pdf', name: 'Lecture Slides - Scalability Patterns.pdf', size: '2.4 MB', link: '#' },
    { type: 'code', name: 'GitHub Repository - Code Examples', size: 'github.com', link: '#' },
    { type: 'document', name: 'Assignment 3 - Building a Scalable API', size: 'PDF', link: '#' },
    { type: 'video', name: 'Pre-recorded Deep Dive - Event Sourcing', size: '45 min', link: '#' }
  ]);

  // Additional UI state
  const [remindedClasses, setRemindedClasses] = useState(new Set());
  const [isRecording, setIsRecording] = useState(false);

  // --- Handlers ---
  const handleJoinClass = (cls) => {
    if (cls.meetLink) {
      window.open(cls.meetLink, '_blank');
    } else {
      alert('Meeting link not available yet.');
    }
  };

  const handleSetReminder = (clsId) => {
    setRemindedClasses(prev => new Set(prev).add(clsId));
    alert('Reminder set for this class!');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    alert('Recording started (placeholder).');
  };

  const handleRegisterWebinar = (webinar) => {
    // Placeholder: open a registration link if it existed.
    alert(`Registered for webinar: ${webinar.title}`);
  };

  // duplicate removed: webinarMessages state

  // duplicate removed: chatInput state


  // STATE: Polls & Q&A
  // duplicate removed: activeTab state

  // duplicate removed: currentPoll state

  // duplicate removed: userVoted state


  // STATE: Class & Webinar Data
  // duplicate removed: liveClasses data


  // duplicate removed: webinars data


  
    



  

  // DRAWING FUNCTIONS
  const isDrawingRef = useRef(false);

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const drawStart = (e) => {
    isDrawingRef.current = true;
    const pos = getCanvasPos(e);
    canvasRef.current.lastX = pos.x;
    canvasRef.current.lastY = pos.y;
  };

  const drawMove = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(e);

    ctx.strokeStyle = isEraser ? '#07050f' : drawingColor;
    ctx.lineWidth = isEraser ? penSize * 3 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(canvas.lastX, canvas.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    canvas.lastX = pos.x;
    canvas.lastY = pos.y;
  };

  const drawEnd = () => { isDrawingRef.current = false; };

  const clearCanvas = () => {
    canvasRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // CHAT FUNCTIONS
  useEffect(() => {
    // Skip the initial mount so opening the page doesn't yank the window down to the chat.
    if (!chatMountedRef.current) { chatMountedRef.current = true; return; }
    // Scroll only the chat container (not the whole page) when a new message arrives.
    const list = chatListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [webinarMessages]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg = { sender: 'You', text: chatInput, time: new Date().toLocaleTimeString() };
    setWebinarMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  const handleVote = (optionIndex) => {
    if (!userVoted) {
      setCurrentPoll(prev => {
        const updated = { ...prev };
        updated.options[optionIndex].votes += 1;
        updated.totalVotes += 1;
        return updated;
      });
      setUserVoted(true);
    }
  };

  // ───────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TAB NAVIGATION */}
      <div className="glass-panel" style={{ padding: '0', display: 'flex', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
        {[
          { id: 'live-classes', label: '📚 My Live Classes', icon: '🎓' },
          { id: 'webinars', label: '🎙️ Webinars & Events', icon: '🎤' },
          { id: 'recordings', label: '🎥 Recordings & Materials', icon: '📹' }
        ].map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '14px 16px',
              background: activeTab === tab.id ? 'rgba(0,210,255,0.1)' : 'transparent',
              border: activeTab === tab.id ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'white',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: idx === 0 ? '12px 0 0 12px' : idx === 2 ? '0 12px 12px 0' : '0',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── MY LIVE CLASSES ─── */}
      {activeTab === 'live-classes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* CREATE CLASS */}
          <div className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', border: '1px solid rgba(0,210,255,0.15)' }}>
            <div>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                <Plus size={18} style={{ color: 'var(--accent-blue)' }} />
                Create New Live Class
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    CLASS TITLE
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Advanced React Patterns"
                    value={newClass.title}
                    onChange={e => setNewClass(p => ({ ...p, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      DATE & TIME
                    </label>
                    <input type="datetime-local" value={newClass.dateTime} onChange={e => setNewClass(p => ({ ...p, dateTime: e.target.value }))} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'white', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      DURATION (MIN)
                    </label>
                    <input type="number" placeholder="60" value={newClass.duration} onChange={e => setNewClass(p => ({ ...p, duration: e.target.value }))} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'white', fontSize: '13px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    MEETING LINK (Google Meet / Zoom)
                  </label>
                  <input type="url" placeholder="https://meet.google.com/..." value={newClass.meetLink} onChange={e => setNewClass(p => ({ ...p, meetLink: e.target.value }))} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'white', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    CLASS DESCRIPTION
                  </label>
                  <textarea
                    placeholder="What will students learn?"
                    value={newClass.description}
                    onChange={e => setNewClass(p => ({ ...p, description: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '13px',
                      height: '60px',
                      resize: 'none'
                    }}
                  />
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                    border: 'none',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                  onClick={handleScheduleClass}
                >
                  📅 Schedule Class
                </button>
                {scheduleMsg && (
                  <p style={{ fontSize: '12px', margin: '4px 0 0', color: scheduleMsg.startsWith('⚠️') ? 'var(--warning)' : 'var(--success)' }}>
                    {scheduleMsg}
                  </p>
                )}
              </div>
            </div>

            {/* QUICK STATS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>CLASSES THIS MONTH</p>
                <h2 style={{ fontSize: '28px', color: 'var(--accent-blue)', margin: '0' }}>12</h2>
              </div>
              <div style={{ background: 'rgba(57,245,212,0.08)', border: '1px solid rgba(57,245,212,0.2)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>ACTIVE STUDENTS</p>
                <h2 style={{ fontSize: '28px', color: 'var(--success)', margin: '0' }}>284</h2>
              </div>
              <div style={{ background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.2)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>AVG ATTENDANCE</p>
                <h2 style={{ fontSize: '28px', color: 'var(--warning)', margin: '0' }}>92%</h2>
              </div>
            </div>
          </div>

          {/* LIVE NOW */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <Video size={18} style={{ color: 'var(--success)' }} />
              Live Classes Now
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {liveClasses.map(cls => (
                <div
                  key={cls.id}
                  style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: cls.status === 'live' ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  {cls.status === 'live' && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      background: 'rgba(57,245,212,0.2)',
                      color: 'var(--success)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      🟢 LIVE
                    </div>
                  )}
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{cls.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>👨‍🏫 {cls.instructor}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>⏰ {cls.startTime} • {cls.duration}</p>

                  {cls.status === 'live' ? (
                    <>
                      <p style={{ fontSize: '11px', color: 'var(--success)', marginBottom: '10px', fontWeight: 600 }}>👥 {cls.students} students attending</p>
                      <button
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                          border: 'none',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        onClick={() => handleJoinClass(cls)}
                      >
                        Join Now →
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '11px', color: 'var(--warning)', marginBottom: '10px' }}>⏳ {cls.startTime}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          onClick={() => handleJoinClass(cls)}
                        >
                          Join Now →
                        </button>
                        <button
                          disabled={remindedClasses.has(cls.id)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: remindedClasses.has(cls.id) ? 'rgba(57,245,212,0.12)' : 'rgba(255,255,255,0.06)',
                            border: remindedClasses.has(cls.id) ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)',
                            color: remindedClasses.has(cls.id) ? 'var(--success)' : 'white',
                            borderRadius: '6px',
                            cursor: remindedClasses.has(cls.id) ? 'default' : 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => { if (!remindedClasses.has(cls.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                          onMouseLeave={e => { if (!remindedClasses.has(cls.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                          onClick={() => handleSetReminder(cls.id)}
                        >
                          {remindedClasses.has(cls.id) ? '✅ Reminder Set' : '🔔 Set Reminder'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* LIVE SESSION INTERFACE */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            {/* LEFT: WHITEBOARD + NOTES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* WHITEBOARD */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>📊 Collaborative Whiteboard</h4>
                <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#0a0915' }}>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    onMouseDown={drawStart}
                    onMouseMove={drawMove}
                    onMouseUp={drawEnd}
                    onMouseLeave={drawEnd}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(135deg, rgba(0,210,255,0.05), rgba(157,78,221,0.05))',
                      cursor: isEraser ? 'cell' : 'crosshair',
                      borderRadius: '10px 10px 0 0',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  />
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '12px',
                    borderRadius: '0 0 10px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    borderTop: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>🎨 COLOR:</span>
                    {['#00d2ff', '#ff007f', '#9d4edd', '#39f5d4', '#ffb703', '#000000'].map(c => (
                      <div
                        key={c}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: c,
                          cursor: 'pointer',
                          border: drawingColor === c && !isEraser ? '3px solid white' : '2px solid transparent',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => { setDrawingColor(c); setIsEraser(false); }}
                      />
                    ))}
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
                    <input
                      type="range"
                      min="2"
                      max="20"
                      value={penSize}
                      onChange={e => setPenSize(Number(e.target.value))}
                      style={{ width: '80px', cursor: 'pointer' }}
                      title={`Pen Size: ${penSize}px`}
                    />
                    <button
                      onClick={() => setIsEraser(!isEraser)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        background: isEraser ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isEraser ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'white',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      🧹 Eraser
                    </button>
                    <button
                      onClick={clearCanvas}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        background: 'rgba(255,0,84,0.1)',
                        border: '1px solid var(--danger)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--danger)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={10} /> Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* CLASS NOTES & RESOURCES */}
              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>📝 Class Notes & Resources</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {resources.map((resource, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <span style={{ fontSize: '14px' }}>
                        {resource.type === 'pdf' ? '📄' : resource.type === 'code' ? '💻' : resource.type === 'document' ? '📋' : '🎬'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {resource.name}
                        </p>
                        <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>{resource.size}</p>
                      </div>
                      <DownloadCloud size={14} style={{ color: 'var(--accent-blue)' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: ATTENDANCE + CHAT + RECORDING + POLL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* ATTENDANCE */}
              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                  Attendance
                </h4>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '32px', color: 'var(--success)', margin: '0 0 4px 0' }}>247</h2>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0' }}>students present</p>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '11px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  📊 View Report
                </button>
              </div>

              {/* LIVE POLL */}
              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 600 }}>📊 Live Poll</h4>
                <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>{currentPoll.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentPoll.options.map((opt, i) => {
                    const percentage = Math.round((opt.votes / currentPoll.totalVotes) * 100);
                    return (
                      <div
                        key={i}
                        onClick={() => handleVote(i)}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                          <span>{opt.text}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{percentage}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${percentage}%`,
                              background: `hsl(${i * 90}, 100%, 50%)`,
                              borderRadius: '3px',
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', margin: '6px 0 0 0' }}>
                    {currentPoll.totalVotes} votes {userVoted ? '(You voted)' : ''}
                  </p>
                </div>
              </div>

              {/* RECORDING */}
              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 600 }}>🎥 Recording</h4>
                <button
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '11px',
                    background: 'rgba(255,0,84,0.1)',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  onClick={handleStartRecording}
                >
                  ⏺️ Start Recording
                </button>
                <p style={{ fontSize: '10px', color: 'var(--success)', marginTop: '8px', textAlign: 'center' }}>
                  ✓ Will be available after class
                </p>
              </div>

              {/* CHAT */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '280px' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 600 }}>💬 Live Chat</h4>
                <div ref={chatListRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {webinarMessages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'You' ? 'flex-end' : 'flex-start' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{m.sender}</span>
                      <div style={{
                        maxWidth: '90%',
                        padding: '6px 10px',
                        borderRadius: m.sender === 'You' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                        background: m.sender === 'You' ? 'var(--accent-purple)' : m.sender === 'Instructor' ? 'rgba(0,210,255,0.15)' : 'rgba(255,255,255,0.05)',
                        fontSize: '12px',
                        wordBreak: 'break-word'
                      }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Ask question..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '11px'
                    }}
                  />
                  <button
                    onClick={sendChat}
                    style={{
                      padding: '8px 10px',
                      background: 'var(--accent-blue)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── WEBINARS & EVENTS ─── */}
      {activeTab === 'webinars' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
              Featured Webinars
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {webinars.map(webinar => (
                <div key={webinar.id} style={{ padding: '16px', background: 'rgba(255,183,3,0.05)', border: '1px solid rgba(255,183,3,0.2)', borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{webinar.title}</h4>
                    <span style={{ fontSize: '10px', background: 'rgba(255,183,3,0.2)', color: 'var(--warning)', padding: '3px 8px', borderRadius: '3px', whiteSpace: 'nowrap', marginLeft: '10px' }}>★ Featured</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>🎤 {webinar.speaker}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                    📅 {webinar.date} • ⏰ {webinar.time}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--accent-blue)', margin: '0 0 10px 0' }}>👥 {webinar.registered.toLocaleString()} registered</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {webinar.features.map((f, i) => (
                      <span key={i} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '3px', color: 'var(--text-secondary)' }}>
                        {f === 'Q&A' ? '❓' : f === 'Polls' ? '📊' : f === 'Certificate' ? '🏆' : '🎥'} {f}
                      </span>
                    ))}
                  </div>
                  <button
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                      border: 'none',
                      color: 'white',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginTop: 'auto',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                  >
                    Register Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── RECORDINGS & MATERIALS ─── */}
      {activeTab === 'recordings' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
            <DownloadCloud size={18} style={{ color: 'var(--accent-blue)' }} />
            Past Classes & Recordings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'MERN Scalability Patterns - Part 1', date: 'Mar 20, 2026', recording: true, materials: 3 },
              { title: 'Advanced DSA: Graphs & Traversals', date: 'Mar 19, 2026', recording: true, materials: 4 },
              { title: 'React Performance Optimization', date: 'Mar 18, 2026', recording: true, materials: 2 },
              { title: 'System Design: Caching Strategies', date: 'Mar 17, 2026', recording: false, materials: 5 }
            ].map((cls, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>{cls.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0' }}>
                    {cls.recording ? '🎥 Recording Available' : '📋 Materials Only'} • {cls.materials} resources • {cls.date}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {cls.recording && (
                    <button
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(0,210,255,0.1)',
                        border: '1px solid var(--accent-blue)',
                        color: 'var(--accent-blue)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      ▶ Watch
                    </button>
                  )}
                  <button
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    📚 Materials
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
