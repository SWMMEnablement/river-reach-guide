import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Waves, BookOpen, ExternalLink, Menu, X, 
  Calculator, GraduationCap, Library, AlertTriangle,
  ChevronDown, Home
} from "lucide-react";
import { CalculatorQuickLaunch } from "./CalculatorQuickLaunch";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string; description?: string }[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  {
    label: "Learn",
    icon: GraduationCap,
    children: [
      { label: "Get Started", href: "/learn/get-started", description: "Build your first model" },
      { label: "Culvert Design", href: "/learn/culverts", description: "Master culvert hydraulics" },
      { label: "Water Surface Profiles", href: "/learn/gvf", description: "GVF profile analysis" },
      { label: "1D/2D Coupling", href: "/learn/coupling", description: "Coupled modeling" },
    ],
  },
  {
    label: "Calculators",
    icon: Calculator,
    children: [
      { label: "All Calculators", href: "/calculators", description: "Calculator hub" },
      { label: "Rating Curve", href: "/calculators/rating-curve" },
      { label: "Culvert Design", href: "/calculators/culvert" },
      { label: "Froude Number", href: "/calculators/froude" },
      { label: "GVF Profile", href: "/calculators/gvf" },
      { label: "Weir & Orifice", href: "/calculators/weir" },
      { label: "Compound Channel", href: "/calculators/compound" },
    ],
  },
  {
    label: "Reference",
    icon: Library,
    children: [
      { label: "Concept Finder", href: "/reference/concepts", description: "Search hydraulic concepts" },
      { label: "Ruby Scripts", href: "/reference/ruby-scripts", description: "ICM automation scripts" },
      { label: "SuDS / LID", href: "/reference/suds", description: "Sustainable drainage" },
      { label: "SWMM Shapes", href: "/reference/swmm-shapes", description: "Channel & conduit shapes" },
    ],
  },
  { label: "Troubleshooting", href: "/troubleshooting", icon: AlertTriangle },
];

const DropdownMenu = ({ item, onClose }: { item: NavItem; onClose: () => void }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = item.children?.some(c => location.pathname === c.href);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <item.icon className="w-3.5 h-3.5" />
        {item.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-50"
          >
            {item.children!.map(child => (
              <Link
                key={child.href}
                to={child.href}
                onClick={() => { setOpen(false); onClose(); }}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  location.pathname === child.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {child.label}
                {child.description && (
                  <span className="block text-xs text-muted-foreground mt-0.5">{child.description}</span>
                )}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const location = useLocation();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-water flex items-center justify-center flex-shrink-0">
                <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-sm sm:text-base truncate block">ICM River Reach Modeler</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Interactive Learning Tool</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5">
              {navItems.map(item =>
                item.children ? (
                  <DropdownMenu key={item.label} item={item} onClose={() => {}} />
                ) : (
                  <Link
                    key={item.href}
                    to={item.href!}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                )
              )}
              <a
                href="https://help.autodesk.com/view/IWICMS/2025/ENU/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                ICM Help
                <ExternalLink className="w-3 h-3" />
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-border bg-background overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
                {navItems.map(item =>
                  item.children ? (
                    <div key={item.label}>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-6 overflow-hidden"
                          >
                            {item.children.map(child => (
                              <Link
                                key={child.href}
                                to={child.href}
                                onClick={closeMenu}
                                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                  location.pathname === child.href
                                    ? "text-primary font-medium bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                }`}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href!}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                        location.pathname === item.href
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                )}
                <a
                  href="https://help.autodesk.com/view/IWICMS/2025/ENU/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  ICM Help
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="py-6 sm:py-8 bg-card border-t border-border safe-area-inset">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                ICM River Reach Modeler — Interactive Learning Tool
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for hydraulic engineers and modelers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
