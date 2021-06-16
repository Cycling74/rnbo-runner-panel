import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import dynamic from "next/dynamic";

const NoSSRRoot = dynamic(() => import("../components/Root"), {
  ssr: false,
});

export default function Home() {
  return <NoSSRRoot />
}
