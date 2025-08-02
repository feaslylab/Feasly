import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Upload, MousePointer, Shield, FileText } from "lucide-react";

export function MiniFeatureGrid() {
  const { t } = useTranslation('common');

  const features = [
    { key: 'import', icon: Upload, color: 'from-primary/10 to-primary-light/10', iconColor: 'text-primary' },
    { key: 'scenario', icon: MousePointer, color: 'from-success/10 to-success-light/10', iconColor: 'text-success' },
    { key: 'zakat', icon: Shield, color: 'from-warning/10 to-warning-light/10', iconColor: 'text-warning' },
    { key: 'audit', icon: FileText, color: 'from-secondary/10 to-accent/10', iconColor: 'text-secondary' }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className={`p-4 rounded-2xl mb-4 w-fit mx-auto bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-foreground">
                {t(`mini.${feature.key}`)}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}