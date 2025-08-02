import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export function FoundersStoryBanner() {
  const { t } = useTranslation('common');

  return (
    <section className="py-16 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <blockquote className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
            "{t('about.storyShort')}"
          </blockquote>
          <cite className="block mt-6 text-lg text-muted-foreground">
            — The Feasly Team
          </cite>
        </motion.div>
      </div>
    </section>
  );
}