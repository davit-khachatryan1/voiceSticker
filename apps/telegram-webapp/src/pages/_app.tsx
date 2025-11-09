import type { AppProps } from 'next/app';
import Script from 'next/script';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Telegram WebApp SDK */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}

