import "../styles/globals.css";

import Link from "next/link";
import Layout from "@/components/layout";

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
    
  )
}
