// Cloudflare Worker for VoiceSticker
// Handles: /upload (R2 storage) and /tg/answer (Telegram API)

export interface Env {
  R2_BUCKET: R2Bucket;
  TELEGRAM_BOT_TOKEN: string;
  ALLOWED_ORIGINS: string; // Comma-separated origins
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    const corsHeaders: HeadersInit = {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (allowedOrigins.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    if (path === '/upload' && request.method === 'POST') {
      return handleUpload(request, env, corsHeaders);
    }

    if (path === '/tg/answer' && request.method === 'POST') {
      return handleTelegramAnswer(request, env, corsHeaders);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

async function handleUpload(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const allowedTypes = ['video/webm', 'video/mp4', 'audio/webm', 'audio/opus'];
    if (!allowedTypes.some(type => file.type.includes(type))) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'webm';
    const filename = `voicesticker-${timestamp}-${random}.${extension}`;

    // Upload to R2
    await env.R2_BUCKET.put(filename, file, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Return public URL (R2 public bucket URL)
    // In production, use your R2 custom domain or CDN
    const publicUrl = `https://pub-${env.R2_BUCKET.name}.r2.dev/${filename}`;

    return new Response(
      JSON.stringify({ url: publicUrl, filename }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Upload failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleTelegramAnswer(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  try {
    const body = await request.json();
    const { queryId, videoUrl, thumbnailUrl, title, duration } = body;

    if (!queryId || !videoUrl) {
      return new Response(
        JSON.stringify({ error: 'queryId and videoUrl required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botToken = env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/answerWebAppQuery`;

    const result = {
      type: 'video',
      id: queryId,
      video_url: videoUrl,
      mime_type: 'video/webm',
      thumbnail_url: thumbnailUrl || videoUrl,
      title: title || 'Voice Sticker',
      video_duration: duration || 0,
      video_width: 512,
      video_height: 512,
    };

    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_id: queryId,
        result: [result],
      }),
    });

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json().catch(() => ({}));
      console.error('Telegram API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Telegram API error', details: errorData }),
        { status: telegramResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const telegramData = await telegramResponse.json();

    return new Response(
      JSON.stringify({ success: true, telegramResponse: telegramData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Telegram answer error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to answer Telegram query' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

