const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

// In-memory windows per type
const windows = { p: [], f: [], e: [], r: [] };

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDU0Mjg1LCJpYXQiOjE3NDcwNTM5ODUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjFiZTE5MDEwLWE2ZTEtNDg5Zi1hMGY3LTI1MDEyNjEzMDE3ZiIsInN1YiI6ImJsLmVuLnU0Y3NlMjIyNDZAYmwuc3R1ZGVudHMuYW1yaXRhLmVkdSJ9LCJlbWFpbCI6ImJsLmVuLnU0Y3NlMjIyNDZAYmwuc3R1ZGVudHMuYW1yaXRhLmVkdSIsIm5hbWUiOiJwYWJib2p1IHlvZ2VuZHJhc2FpIiwicm9sbE5vIjoiYmwuZW4udTRjc2UyMjI0NiIsImFjY2Vzc0NvZGUiOiJTd3V1S0UiLCJjbGllbnRJRCI6IjFiZTE5MDEwLWE2ZTEtNDg5Zi1hMGY3LTI1MDEyNjEzMDE3ZiIsImNsaWVudFNlY3JldCI6IlhTcHdqYnVkdXhoRndqemUifQ.hFmUz9B9Lg3nHuWwKN6MxUeE6l5-C2YfoE4EhbrrNfY';

async function fetchWithTimeout(url, ms = 500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`
      }
    });
    clearTimeout(id);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Fetch failed: ${res.status} ${res.statusText} - ${errorText}`);
      throw new Error('Bad response');
    }

    const json = await res.json();
    return json.numbers;
  } catch (err) {
    console.error('Fetch error:', err.message);
    return null;
  }
}


app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type;
  if (!windows[type]) return res.status(400).json({ error: 'Invalid type' });

  const prev = [...windows[type]];
  const apiMap = { p: 'primes', f: 'fibo', e: 'even', r: 'rand' };

  const url = `http://20.244.56.144/evaluation-service/${apiMap[type]}`;
  const nums = await fetchWithTimeout(url);

  if (!nums) {
    return res
      .status(500)
      .json({ error: 'Third-party fetch failed or timed out' });
  }

  nums.forEach((n) => {
    if (!windows[type].includes(n)) windows[type].push(n);
  });

  if (windows[type].length > WINDOW_SIZE) {
    windows[type] = windows[type].slice(-WINDOW_SIZE);
  }

  const curr = [...windows[type]];
  const avg =
    curr.reduce((sum, val) => sum + val, 0) / (curr.length || 1);

  res.json({
    windowPrevState: prev,
    windowCurrState: curr,
    numbers: nums,
    avg,
  });
});

app.listen(PORT, () =>
  console.log(`Average Calculator running on port ${PORT}`)
);
