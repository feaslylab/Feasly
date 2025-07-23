import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PricingSection() {
  const { t } = useTranslation('marketing');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
    }
  };

  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Perfect for small projects",
      features: [
        "Up to 3 projects",
        "Basic scenario modeling",
        "Excel import",
        "Email support"
      ],
      highlighted: false
    },
    {
      name: "Business",
      price: "$99",
      period: "/month",
      description: "For growing development teams",
      features: [
        "Unlimited projects",
        "Advanced scenarios",
        "Arabic support",
        "Priority support",
        "Export to PDF",
        "Version history"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Business",
        "Custom integrations",
        "Dedicated support",
        "Training sessions",
        "SLA guarantee"
      ],
      highlighted: false
    }
  ];

  return (
    <section className="py-28 bg-surface/60 backdrop-blur-[2px]" id="pricing">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <motion.div variants={cardVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                className={`rounded-3xl p-10 shadow-xl bg-white/[0.96] transition-all duration-300 hover:scale-105 ${
                  plan.highlighted ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* Plan name */}
                <h3 className="text-2xl font-medium mb-4">{plan.name}</h3>
                
                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="text-lg text-muted-foreground">{plan.period}</span>
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground mb-8">{plan.description}</p>
                
                {/* Features list */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Button 
                  variant={plan.highlighted ? "default" : "outline"} 
                  className="w-full" 
                  size="lg"
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}