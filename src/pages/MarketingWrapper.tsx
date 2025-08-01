import { useEffect } from "react";
import { EnhancedMarketingLayout } from "@/components/marketing/EnhancedMarketingLayout";
import MarketingHome from "./MarketingHome";

export default function MarketingWrapper() {
  useEffect(() => {
    // Set page title for the marketing site
    document.title = "Feasly | Next-Gen Real Estate Financial Modeling";
  }, []);

  return (
    <EnhancedMarketingLayout>
      <MarketingHome />
    </EnhancedMarketingLayout>
  );
}