import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { queryId, videoUrl, thumbnailUrl, title, duration } = req.body;

    if (!queryId || !videoUrl) {
      return res.status(400).json({ error: 'queryId and videoUrl required' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    // Call Telegram Bot API answerWebAppQuery
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/answerWebAppQuery`;

    const result = {
      type: 'video',
      id: queryId,
      video_url: videoUrl,
      mime_type: 'video/mp4',
      thumbnail_url: thumbnailUrl || videoUrl,
      title: title || 'Voice Sticker',
      video_duration: duration || 0,
      video_width: 512,
      video_height: 512,
    };

    // Make actual API call to Telegram
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query_id: queryId, 
        result: [result] // Telegram expects an array
      }),
    });

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json().catch(() => ({}));
      console.error('Telegram API error:', errorData);
      return res.status(telegramResponse.status).json({ 
        error: 'Telegram API error',
        details: errorData 
      });
    }

    const telegramData = await telegramResponse.json();
    
    return res.status(200).json({
      success: true,
      result,
      telegramResponse: telegramData,
    });
  } catch (error) {
    console.error('Error answering Telegram query:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

