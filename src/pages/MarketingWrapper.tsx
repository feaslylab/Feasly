import { useEffect } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import SimpleMarketingHome from "./SimpleMarketingHome";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function MarketingWrapper() {
  useEffect(() => {
    // Set page title for the marketing site
    document.title = "Feasly | Next-Gen Real Estate Financial Modeling";
    console.log("MarketingWrapper rendered");
  }, []);

  return (
    <ErrorBoundary>
      <MarketingLayout>
        <ErrorBoundary>
          <SimpleMarketingHome />
        </ErrorBoundary>
      </MarketingLayout>
    </ErrorBoundary>
  );
}