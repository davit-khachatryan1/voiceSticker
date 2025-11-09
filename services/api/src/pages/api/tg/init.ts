import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

interface TelegramInitData {
  query_id?: string;
  user?: string;
  auth_date?: string;
  hash?: string;
  [key: string]: string | undefined;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'initData required' });
    }

    // Parse initData
    const params = new URLSearchParams(initData);
    const data: TelegramInitData = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    // Validate HMAC
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const hash = data.hash;
    delete data.hash;

    // Create data-check-string
    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    // Calculate secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return res.status(401).json({ error: 'Invalid HMAC' });
    }

    // Check auth_date (should be within 24 hours)
    const authDate = parseInt(data.auth_date || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return res.status(401).json({ error: 'initData expired' });
    }

    // Extract user info
    let user;
    if (data.user) {
      try {
        user = JSON.parse(data.user);
      } catch {
        user = null;
      }
    }

    return res.status(200).json({
      valid: true,
      userId: user?.id,
      chatId: data.chat_id,
    });
  } catch (error) {
    console.error('Error validating Telegram initData:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

