import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  title: string;
  icon: React.ReactNode;
  formula?: string;
  description: string;
  details: string[];
  color: 'water' | 'primary' | 'terrain';
}

export const ICMConceptCard = ({ title, icon, formula, description, details, color }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses = {
    water: 'bg-water/10 border-water/30 hover:border-water/50',
    primary: 'bg-primary/10 border-primary/30 hover:border-primary/50',
    terrain: 'bg-terrain/10 border-terrain/30 hover:border-terrain/50',
  };

  const iconColorClasses = {
    water: 'text-water',
    primary: 'text-primary',
    terrain: 'text-terrain',
  };

  return (
    <motion.div
      className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${colorClasses[color]}`}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-white shadow-sm ${iconColorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            {formula && (
              <p className="text-sm font-mono text-muted-foreground mt-1">{formula}</p>
            )}
          </div>
        </div>
        <button className="p-1 rounded-full hover:bg-white/50 transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">{description}</p>
              <ul className="space-y-2">
                {details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      color === 'water' ? 'bg-water' : 
                      color === 'primary' ? 'bg-primary' : 'bg-terrain'
                    }`} />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
