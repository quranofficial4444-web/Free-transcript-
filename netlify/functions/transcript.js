const { YoutubeTranscript } = require('youtube-transcript');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
  try {
    const q = event.queryStringParameters || {};
    let input = q.url || q.videoId || q.id;
    if (!input && event.body) {
      const b = JSON.parse(event.body);
      input = b.url || b.videoId || b.id;
    }
    if (!input) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please provide a YouTube link.' }) };
    }
    const items = await YoutubeTranscript.fetchTranscript(input);
    const transcript = items.map(i => ({ text: i.text, offset: i.offset, duration: i.duration }));
    const text = items.map(i => i.text).join(' ');
    return { statusCode: 200, headers, body: JSON.stringify({ transcript, text }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message || 'Could not get transcript.' }) };
  }
};
