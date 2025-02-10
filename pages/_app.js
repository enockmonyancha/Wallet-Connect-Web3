// pages/_app.js
import '@/styles/globals.css'
import ContextProvider from '@/context'

function MyApp({ Component, pageProps }) {
  return (
    <ContextProvider cookies={pageProps.cookies}>
      <Component {...pageProps} />
    </ContextProvider>
  )
}

export default MyApp
