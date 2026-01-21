import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ChevronDown, ChevronUp, X, Lightbulb, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchConcepts, getConceptsByCategory, getRelatedConcepts, Concept } from './knowledgeBase';

interface ConceptCardProps {
  concept: Concept;
  isExpanded: boolean;
  onToggle: () => void;
  onRelatedClick: (id: string) => void;
}

const categoryColors: Record<Concept['category'], string> = {
  fundamentals: 'bg-primary/10 text-primary border-primary/30',
  equations: 'bg-water/10 text-water border-water/30',
  modeling: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400',
  troubleshooting: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400',
  structures: 'bg-terrain/10 text-terrain border-terrain/30',
  software: 'bg-secondary text-foreground border-border',
};

const categoryLabels: Record<Concept['category'], string> = {
  fundamentals: 'Fundamentals',
  equations: 'Equations',
  modeling: 'Modeling',
  troubleshooting: 'Troubleshooting',
  structures: 'Structures',
  software: 'Software',
};

const ConceptCard = ({ concept, isExpanded, onToggle, onRelatedClick }: ConceptCardProps) => {
  const relatedConcepts = getRelatedConcepts(concept.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[concept.category]}`}>
              {categoryLabels[concept.category]}
            </span>
          </div>
          <h4 className="font-semibold text-foreground">{concept.title}</h4>
          {concept.formula && (
            <p className="text-sm font-mono text-muted-foreground mt-1">{concept.formula}</p>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
              <p className="text-sm text-muted-foreground">{concept.description}</p>
              
              <ul className="space-y-1.5">
                {concept.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-foreground">{detail}</span>
                  </li>
                ))}
              </ul>

              {relatedConcepts.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Related concepts:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {relatedConcepts.map(related => (
                      <button
                        key={related.id}
                        onClick={() => onRelatedClick(related.id)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                      >
                        {related.title}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const categories: Concept['category'][] = ['fundamentals', 'equations', 'modeling', 'structures', 'troubleshooting', 'software'];

export const ConceptFinder = () => {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Concept['category'] | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const results = useMemo(() => {
    if (query.trim()) {
      return searchConcepts(query);
    }
    if (selectedCategory) {
      return getConceptsByCategory(selectedCategory);
    }
    return [];
  }, [query, selectedCategory]);

  const handleRelatedClick = (id: string) => {
    const concept = results.find(c => c.id === id) || searchConcepts(id)[0];
    if (concept) {
      setQuery(concept.title);
      setExpandedId(concept.id);
      setSelectedCategory(null);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedCategory(null);
    setExpandedId(null);
  };

  const suggestedSearches = [
    "Manning's equation",
    "Froude number",
    "Preissmann slot",
    "Courant number",
    "GVF profiles",
  ];

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Concept Finder
              <Lightbulb className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground">Search hydraulic concepts, equations, and troubleshooting tips</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search Input */}
            <div className="p-4 border-t border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedCategory(null);
                  }}
                  placeholder="Search concepts... (e.g., 'Froude', 'backwater', 'oscillations')"
                  className="pl-10 pr-10"
                />
                {(query || selectedCategory) && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat ? null : cat);
                      setQuery('');
                      setExpandedId(null);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selectedCategory === cat
                        ? categoryColors[cat]
                        : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto px-4 pb-4">
              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map(concept => (
                    <ConceptCard
                      key={concept.id}
                      concept={concept}
                      isExpanded={expandedId === concept.id}
                      onToggle={() => setExpandedId(expandedId === concept.id ? null : concept.id)}
                      onRelatedClick={handleRelatedClick}
                    />
                  ))}
                </div>
              ) : query || selectedCategory ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No concepts found for "{query || categoryLabels[selectedCategory!]}"</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Search for any hydraulic concept or browse by category
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Popular searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(term)}
                          className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
