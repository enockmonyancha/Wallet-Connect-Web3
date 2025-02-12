// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html className="scroll-smooth dark">
        <Head>
          {/* Google Fonts: Inter */}
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
    
        </Head>
        <body className="antialiased text-gray-900 dark:text-gray-100 dark:bg-red-600">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
