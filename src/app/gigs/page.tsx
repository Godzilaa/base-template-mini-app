import { Metadata } from "next";
import GigsPage from "./GigsPage";

export const metadata: Metadata = {
  title: "Gigs - BaseReviews",
  description: "Find review gigs and earn crypto for authentic reviews on BaseReviews",
};

export default function Gigs() {
  return <GigsPage />;
}