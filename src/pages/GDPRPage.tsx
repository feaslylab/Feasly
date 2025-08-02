import { useTranslation } from "react-i18next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function GDPRPage() {
  const { t } = useTranslation('common');

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-background">
        <section className="py-24">
          <div className="container px-4 mx-auto">
            <h1 className="text-4xl font-bold mb-8">{t('footer.gdpr')}</h1>
            <div className="prose prose-lg max-w-4xl">
              <p className="text-xl text-muted-foreground mb-8">
                General Data Protection Regulation compliance information.
              </p>
              <p className="text-muted-foreground">
                GDPR compliance details coming soon.
              </p>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}