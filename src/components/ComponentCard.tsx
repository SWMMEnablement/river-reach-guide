import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ComponentCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  color: "water" | "node" | "terrain";
}

const colorClasses = {
  water: {
    bg: "bg-water-light",
    icon: "text-water-dark",
    border: "border-water/20",
    bullet: "bg-water",
  },
  node: {
    bg: "bg-node-light",
    icon: "text-node",
    border: "border-node/20",
    bullet: "bg-node",
  },
  terrain: {
    bg: "bg-terrain-light",
    icon: "text-terrain",
    border: "border-terrain/20",
    bullet: "bg-terrain",
  },
};

export const ComponentCard = ({
  icon,
  title,
  description,
  features,
  color,
}: ComponentCardProps) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-card rounded-xl p-6 border ${colors.border} shadow-sm hover:shadow-lg transition-all duration-300`}
    >
      <div
        className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}
      >
        <div className={colors.icon}>{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-foreground">
            <span className={`w-1.5 h-1.5 rounded-full ${colors.bullet}`} />
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
