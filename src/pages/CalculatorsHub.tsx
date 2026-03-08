import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Circle, Waves, Layers, Droplets, Zap } from "lucide-react";

const calculators = [
  {
    title: "Rating Curve Generator",
    description: "Generate stage-discharge rating curves with observed data comparison and R² fitting.",
    href: "/calculators/rating-curve",
    icon: TrendingUp,
    color: "primary",
  },
  {
    title: "Culvert Design Calculator",
    description: "HY-8 methodology for inlet/outlet control analysis with head loss breakdown.",
    href: "/calculators/culvert",
    icon: Circle,
    color: "water",
  },
  {
    title: "Froude Number Calculator",
    description: "Flow regime analysis with subcritical/supercritical transition detection.",
    href: "/calculators/froude",
    icon: Waves,
    color: "terrain",
  },
  {
    title: "GVF Profile Calculator",
    description: "Step-backwater method with all six M/S profile types and slope classification.",
    href: "/calculators/gvf",
    icon: TrendingUp,
    color: "node",
  },
  {
    title: "Weir & Orifice Calculator",
    description: "Sharp-crested, broad-crested, and V-notch weirs plus orifice calculations.",
    href: "/calculators/weir",
    icon: Droplets,
    color: "water",
  },
  {
    title: "Compound Channel Calculator",
    description: "Divided channel method with Lotter composite roughness and Coriolis corrections.",
    href: "/calculators/compound",
    icon: Layers,
    color: "terrain",
  },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary border-primary/30",
  water: "bg-water/10 text-water border-water/30",
  terrain: "bg-terrain/10 text-terrain border-terrain/30",
  node: "bg-node/10 text-node border-node/30",
};

const CalculatorsHub = () => (
  <section className="py-10 sm:py-16 lg:py-24">
    <div className="container mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Calculator className="w-4 h-4" />
          Hydraulic Calculators
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Engineering Calculators
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Six real hydraulic calculators with correct physics, interpretation panels, and ICM-compatible export.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {calculators.map((calc, i) => (
          <motion.div
            key={calc.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={calc.href}
              className={`block p-6 rounded-xl border-2 bg-card hover:shadow-lg transition-all hover:border-primary/50 group ${colorMap[calc.color]?.split(" ")[2] || "border-border"}`}
            >
              <div className={`inline-flex p-3 rounded-lg mb-4 ${colorMap[calc.color]}`}>
                <calc.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {calc.title}
              </h3>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CalculatorsHub;
