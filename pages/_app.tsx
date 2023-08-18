import '../styles/globals.css'
import Navbar from '../components/navbar'
import {CeramicWrapper} from "../context";
import type { AppProps } from 'next/app'

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
    <Navbar />
    <CeramicWrapper>
      <Component {...pageProps} ceramic />
    </CeramicWrapper>
    </>
  );
}

export default MyApp