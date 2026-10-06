const { YoutubeTranscript } = require('youtube-transcript');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
  try {
    const q = event.queryStringParameters || {};
    let input = q.url || q.vid || q.id;
    if (!input && event.body) {
      try {
        const b = JSON.parse(event.body);
        input = b.url || b.vid || b.id;
      } catch {}
    }
    if (!input) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please provide a YouTube link.' }) };
    }

    // Video ID nikalna
    let videoId = input;
    if (input.includes('youtube.com') || input.includes('youtu.be')) {
        const match = input.match(/(?:v=|\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
        if (match) videoId = match[1];
        else videoId = input.split('v=')[1]?.split('&')[0] || input.split('/').pop().split('?')[0];
    }

    const items = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = items.map(i => i.text).join(' ');
    const duration = items.length? items[items.length-1].offset + items[items.length-1].duration : 0;

    return { statusCode: 200, headers, body: JSON.stringify({ text: transcript, duration }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message || 'Could not get transcript.' }) };
  }
};
