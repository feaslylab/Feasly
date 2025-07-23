import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock } from "lucide-react";

const timelineSteps = [
  { title: "Import Data", description: "Upload Excel or .edmf files", status: "completed" },
  { title: "Configure Model", description: "Set assumptions and parameters", status: "completed" },
  { title: "Run Analysis", description: "Generate financial projections", status: "active" },
  { title: "Review Results", description: "Validate outputs and scenarios", status: "pending" },
  { title: "Export Reports", description: "Generate client-ready documents", status: "pending" }
];

export function TimelineProgress() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-semibold mb-6">Project Workflow</h3>
      
      <div className="space-y-4">
        {timelineSteps.map((step, index) => (
          <motion.div
            key={step.title}
            className="flex items-start gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="relative">
              {step.status === "completed" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  <CheckCircle className="h-6 w-6 text-success" />
                </motion.div>
              )}
              {step.status === "active" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="h-6 w-6 text-primary" />
                </motion.div>
              )}
              {step.status === "pending" && (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
              
              {index < timelineSteps.length - 1 && (
                <motion.div
                  className="absolute top-8 left-3 w-px bg-border"
                  initial={{ height: 0 }}
                  animate={{ height: 32 }}
                  transition={{ delay: index * 0.2 + 0.5 }}
                />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className={`font-medium ${
                step.status === "active" ? "text-primary" : 
                step.status === "completed" ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step.title}
              </h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}