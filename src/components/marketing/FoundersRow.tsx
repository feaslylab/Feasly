import { motion } from "framer-motion";

export function FoundersRow() {
  const founders = [
    {
      name: "Nick Pashayev",
      bio: "10 yrs PIF & NEOM feasibility",
      image: "/assets/nick.jpg"
    },
    {
      name: "Co-Founder",
      bio: "GCC real-estate tech lead", 
      image: "/assets/cofounder.jpg"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built by GCC Real Estate Veterans
          </h2>
          <p className="text-lg text-muted-foreground">
            Decades of mega-project experience, now in your hands
          </p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {founders.map((founder, index) => (
            <motion.div
              key={index}
              className="max-w-[280px] mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="backdrop-blur-md bg-white/15 dark:bg-white/5 shadow-lg/20 rounded-2xl p-6 text-center border border-white/10">
                <div className="mb-4">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-16 h-16 rounded-full mx-auto object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{founder.name}</h3>
                <p className="text-sm text-muted-foreground">{founder.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}