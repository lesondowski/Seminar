import "@/styles/globals.css";
import { Be_Vietnam_Pro } from "next/font/google";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={beVietnamPro.className}>
      <Component {...pageProps} />
    </div>
  );
}
