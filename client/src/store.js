import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialResume = {
  fullName: 'Shamutha Candidate',
  email: 'candidate@shamutha.edu',
  phone: '+1 (555) 123-4567',
  bio: 'Motivated Full Stack developer eager to build production-grade web applications.',
  education: 'B.S. Computer Science - Shamutha Institute of Technology',
  experience: 'Software Engineer Intern - Google Summer of Code (React components).',
  skills: 'React, Node.js, Express, MongoDB, Redux, Docker'
};

const initialState = {
  resume: {
    data: initialResume,
    plagiarismScore: 0,
    plagiarismCheckedAt: null
  },
  placement: {
    appliedJobs: []
  },
  subscription: {
    plan: 'free',
    active: false,
    nextBilling: null,
    paymentMethod: null
  }
};

const persistedState = (() => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('sham-redux-state');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
})();

const resumeSlice = createSlice({
  name: 'resume',
  initialState: persistedState.resume || initialState.resume,
  reducers: {
    setResumeField(state, action) {
      const { key, value } = action.payload;
      state.data[key] = value;
    },
    setResumeData(state, action) {
      state.data = action.payload;
    },
    setPlagiarismResult(state, action) {
      state.plagiarismScore = action.payload.score;
      state.plagiarismCheckedAt = action.payload.time;
    }
  }
});

const placementSlice = createSlice({
  name: 'placement',
  initialState: persistedState.placement || initialState.placement,
  reducers: {
    addAppliedJob(state, action) {
      if (!state.appliedJobs.includes(action.payload)) {
        state.appliedJobs.push(action.payload);
      }
    },
    setAppliedJobs(state, action) {
      state.appliedJobs = action.payload;
    }
  }
});

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: persistedState.subscription || initialState.subscription,
  reducers: {
    setSubscriptionPlan(state, action) {
      state.plan = action.payload;
    },
    activateSubscription(state) {
      state.active = true;
      state.nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    },
    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload;
    }
  }
});

const store = configureStore({
  reducer: {
    resume: resumeSlice.reducer,
    placement: placementSlice.reducer,
    subscription: subscriptionSlice.reducer
  },
  preloadedState: persistedState
});

store.subscribe(() => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('sham-redux-state', JSON.stringify(store.getState()));
  } catch {
    // Ignore localStorage persistence failures silently
  }
});

export const { setResumeField, setResumeData, setPlagiarismResult } = resumeSlice.actions;
export const { addAppliedJob, setAppliedJobs } = placementSlice.actions;
export const { setSubscriptionPlan, activateSubscription, setPaymentMethod } = subscriptionSlice.actions;
export default store;
