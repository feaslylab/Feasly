import { useEffect } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import MarketingHome from "./MarketingHome";

export default function MarketingWrapper() {
  useEffect(() => {
    // Set page title for the marketing site
    document.title = "Feasly | Next-Gen Real Estate Financial Modeling";
  }, []);

  return (
    <MarketingLayout>
      <MarketingHome />
    </MarketingLayout>
  );
}