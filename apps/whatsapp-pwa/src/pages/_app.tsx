import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#25D366" />
        <link rel="manifest" href="/manifest.json" />
        <title>VoiceSticker - WhatsApp</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

