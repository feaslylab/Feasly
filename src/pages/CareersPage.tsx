import { useTranslation } from "react-i18next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function CareersPage() {
  const { t } = useTranslation('common');

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-background">
        <section className="py-24">
          <div className="container px-4 mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8">{t('footer.careers')}</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join our team building the future of real estate feasibility modeling.
            </p>
            <p className="text-muted-foreground">
              Career opportunities coming soon. Stay tuned!
            </p>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}