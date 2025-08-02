import { ShieldCheck, Server, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function TrustStrip() {
  const trustItems = [
    { icon: ShieldCheck, text: "DIFC-licensed" },
    { icon: Server, text: "Hosted in UAE" },
    { icon: CheckCircle, text: "Zakat/VAT compliant" }
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