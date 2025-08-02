import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Upload, Settings, Download } from "lucide-react";

export function HowItWorks() {
  const { t } = useTranslation('common');

  const steps = [
    { key: 'upload', icon: Upload, color: 'from-primary/10 to-primary-light/10', iconColor: 'text-primary' },
    { key: 'model', icon: Settings, color: 'from-success/10 to-success-light/10', iconColor: 'text-success' },
    { key: 'export', icon: Download, color: 'from-warning/10 to-warning-light/10', iconColor: 'text-warning' }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Three simple steps to feasibility success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="text-center group"
            >
              <div className={`p-6 rounded-2xl mb-6 w-fit mx-auto bg-gradient-to-br ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className={`h-12 w-12 ${step.iconColor}`} />
              </div>
              <div className="text-lg font-bold mb-2 text-foreground">
                {index + 1}. {t(`how.${step.key}`)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}