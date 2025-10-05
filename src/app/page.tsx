import { Metadata } from "next";
import App from "./app";

const APP_NAME = "BaseReviews";
const APP_DESCRIPTION = "Decentralized gig economy platform where businesses fund review campaigns and workers get paid for genuine reviews";
const APP_OG_IMAGE_URL = "https://basereviews.vercel.app/og-image.png";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [APP_OG_IMAGE_URL],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [APP_OG_IMAGE_URL],
    },
  };
}

export default function Home() {
  return (<App />);
}
