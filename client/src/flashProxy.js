const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export async function callFlashDetector(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Flash detector proxy requires a JSON payload.');
  }

  const res = await fetch(`${BACKEND_URL}/api/proxy/flash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();

  let body;
  try {
    body = JSON.parse(text);
  } catch (e) {
    body = { text };
  }

  return { status: res.status, ok: res.ok, body };
}

// Dev helper: attach to window for quick testing in browser console
if (typeof window !== 'undefined') {
  window.callFlashDetector = async (p) => {
    try {
      return await callFlashDetector(p || { test: 'ping' });
    } catch (e) {
      return { error: e.message };
    }
  };
}

export default callFlashDetector;
