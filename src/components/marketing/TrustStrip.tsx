import { Shield, Server, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function TrustStrip() {
  const { t } = useTranslation('common');
  
  const trustItems = [
    { icon: Shield, text: t('trust.encryption') },
    { icon: Server, text: t('trust.datacentres') },
    { icon: CheckCircle, text: t('trust.taxReady') }
  ];

  return (
    <section className="py-12 border-y border-border/50 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {trustItems.map((item, index) => (
            <motion.div 
              key={index}
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {item.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}