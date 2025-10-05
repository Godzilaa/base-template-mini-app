import { Metadata } from "next";
import BusinessDashboard from "./BusinessDashboard";

export const metadata: Metadata = {
  title: "Business Dashboard - BaseReviews",
  description: "Manage your review campaigns and track performance on BaseReviews",
};

export default function BusinessPage() {
  return <BusinessDashboard />;
}