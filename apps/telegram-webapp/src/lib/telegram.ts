// Telegram WebApp utilities

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
          chat?: {
            id: number;
            type: string;
          };
          query_id?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
      };
    };
  }
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

export function getTelegramWebApp() {
  if (!isTelegramWebApp()) {
    return null;
  }
  return window.Telegram!.WebApp;
}

export function initTelegramWebApp() {
  if (isTelegramWebApp()) {
    const webApp = window.Telegram!.WebApp;
    webApp.ready();
    webApp.expand();
    return webApp;
  }
  return null;
}

export function validateInitData(initData: string): Promise<boolean> {
  // Validate with backend
  return fetch('/api/tg/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData }),
  })
    .then((res) => res.json())
    .then((data) => data.valid === true)
    .catch(() => false);
}

