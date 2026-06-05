// server/webrtc.js

// Simple in‑memory signalling store – suitable for development / proof‑of‑concept.
// In a production system you would forward these messages via Redis or another
// real‑time channel so that the receiving peer can retrieve them.

const signallingStore = {};

/**
 * Store an SDP offer from `from` to `to`.
 */
export function handleWebRTCOffer(from, to, offer) {
  const key = `${from}->${to}`;
  signallingStore[key] = { offer };
  console.warn(`⚡️ WebRTC offer stored for ${key}`);
}

/**
 * Store an SDP answer from `from` to `to`.
 */
export function handleWebRTCAnswer(from, to, answer) {
  const key = `${from}->${to}`;
  if (!signallingStore[key]) signallingStore[key] = {};
  signallingStore[key].answer = answer;
  console.warn(`⚡️ WebRTC answer stored for ${key}`);
}

/**
 * Store an ICE candidate from `from` to `to`.
 */
export function handleWebRTCCandidate(from, to, candidate) {
  const key = `${from}->${to}`;
  if (!signallingStore[key]) signallingStore[key] = { candidates: [] };
  signallingStore[key].candidates = signallingStore[key].candidates || [];
  signallingStore[key].candidates.push(candidate);
  console.warn(`⚡️ WebRTC candidate stored for ${key}`);
}

export default {
  handleWebRTCOffer,
  handleWebRTCAnswer,
  handleWebRTCCandidate,
};
