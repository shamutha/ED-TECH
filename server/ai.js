// server/ai.js

import OpenAI from 'openai';
import fs from 'fs';

// Initialize OpenAI client if API key is provided (OpenAI SDK v4)
const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

/**
 * Transcribe an audio file using OpenAI Whisper.
 * Expects a local file path to the uploaded audio.
 */
export async function transcribeAudio(filePath) {
  if (!openai) {
    // Stub response when API key is missing
    return { text: '[Transcription stub – OpenAI key missing]' };
  }
  try {
    const resp = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1'
    });
    return resp;
  } catch (err) {
    console.error('OpenAI transcription error:', err);
    throw err;
  }
}

/**
 * Stub plagiarism checker – always returns 0% similarity.
 */
export async function checkPlagiarism(_code) {
  // In a real implementation you would call an external service.
  return { similarity: 0, message: 'Placeholder – no plagiarism detected' };
}

export default { transcribeAudio, checkPlagiarism };
