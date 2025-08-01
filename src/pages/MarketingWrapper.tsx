import { useEffect } from "react";
import { EnhancedMarketingLayout } from "@/components/marketing/EnhancedMarketingLayout";
import NewMarketingHome from "./NewMarketingHome";

export default function MarketingWrapper() {
  useEffect(() => {
    // Set page title for the marketing site
    document.title = "Feasly | Modern Modeling Infrastructure for the GCC";
  }, []);

  return (
    <EnhancedMarketingLayout>
      <NewMarketingHome />
    </EnhancedMarketingLayout>
  );
}