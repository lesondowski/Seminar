import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { LanguageProvider } from '../utils/i18n/LanguageContext'
import { TourCartProvider } from '../utils/tourCart/TourCartContext'
import { ChatbotProvider } from '../utils/chatbot/ChatbotContext'

const ChatbotWidget = dynamic(() => import('../components/chatbot/ChatbotWidget'), {
  ssr: false,
})

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <TourCartProvider>
        <ChatbotProvider>
          <Component {...pageProps} />
          <ChatbotWidget />
        </ChatbotProvider>
      </TourCartProvider>
    </LanguageProvider>
  )
}