import { Component } from 'react';
import Head from 'next/head';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(_error, _errorInfo) {
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 48,
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Algo salió mal</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>Ha ocurrido un error inesperado.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '10px 20px',
              background: '#1a1a2e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Plataforma de estadísticas y scouting de fútbol amateur"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <title>AmateurBaleares</title>
        <style>{`
          * { box-sizing: border-box; }
          input:focus, select:focus, button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.2);
            border-color: #1a1a2e;
          }
          button:focus-visible {
            outline: 2px solid #1a1a2e;
            outline-offset: 2px;
            box-shadow: none;
          }
        `}</style>
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}
