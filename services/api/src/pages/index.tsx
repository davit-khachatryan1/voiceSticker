export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>VoiceSticker Render API</h1>
      <p>API is running. Use the endpoints:</p>
      <ul>
        <li><code>POST /api/jobs</code> - Create a render job</li>
        <li><code>GET /api/jobs/:id</code> - Get job status</li>
        <li><code>WS /api/ws</code> - WebSocket for real-time updates</li>
        <li><code>POST /api/tg/init</code> - Validate Telegram initData</li>
        <li><code>POST /api/tg/answer</code> - Answer Telegram WebApp query</li>
      </ul>
    </div>
  );
}

