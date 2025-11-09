import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Telegram WebApp SDK is loaded via script tag in _document.tsx
  return <Component {...pageProps} />;
}

