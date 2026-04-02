import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import Navbar from '../components/common/Navbar'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
    </>
  )
}