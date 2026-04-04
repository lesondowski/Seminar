import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import { LanguageProvider } from '../utils/i18n/LanguageContext'
import { TourCartProvider } from '../utils/tourCart/TourCartContext'

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <TourCartProvider>
        <Component {...pageProps} />
      </TourCartProvider>
    </LanguageProvider>
  )
}