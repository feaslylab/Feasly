import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function PainPromise() {
  const { t } = useTranslation('common');

  const painPoints = [
    { key: 'formula', icon: '🐛' },
    { key: 'version', icon: '📂' },
    { key: 'scenario', icon: '⏱️' },
    { key: 'handover', icon: '🔄' }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {painPoints.map((pain, index) => (
              <motion.div
                key={pain.key}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 group"
              >
                <div className="text-3xl">{pain.icon}</div>
                <div className="flex items-center gap-3 text-lg">
                  <span className="text-muted-foreground">
                    {t(`pain.${pain.key}`).split(' → ')[0]} →
                  </span>
                  <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                  <span className="font-semibold text-foreground">
                    {t(`pain.${pain.key}`).split(' → ')[1]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}