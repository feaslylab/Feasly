import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";
import { useTranslation } from "react-i18next";

export function StickyCTAFooter() {
  const { t } = useTranslation('marketing');
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            {t('home.stickyCTAFooter.title')}
          </h2>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="px-8 py-3" asChild>
                <Link to="/demo" aria-label={t('home.stickyCTAFooter.tryDemo')}>
                  <Play className="mr-2 h-4 w-4" />
                  {t('home.stickyCTAFooter.tryDemo')}
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3" asChild>
                <Link to="/welcome" aria-label={t('home.stickyCTAFooter.startTrial')}>
                  {t('home.stickyCTAFooter.startTrial')}
                </Link>
              </Button>
            </div>
            
            <div className="max-w-md mx-auto">
              <WaitlistForm 
                placeholder={t('home.stickyCTAFooter.placeholder')}
                buttonText={t('home.stickyCTAFooter.startTrial')}
                className="justify-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}