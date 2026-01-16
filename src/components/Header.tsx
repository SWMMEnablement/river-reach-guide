import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, BookOpen, ExternalLink, GraduationCap, PenTool, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#diagram", label: "Diagram", icon: null },
  { href: "#editor", label: "Editor", icon: PenTool },
  { href: "#steps", label: "Steps", icon: null },
  { href: "#quiz", label: "Quiz", icon: GraduationCap },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-water flex items-center justify-center flex-shrink-0">
              <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground text-sm sm:text-base truncate">ICM River Reach Modeler</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Interactive Learning Tool</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-5"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                {link.label}
              </a>
            ))}
            <a
              href="https://help.autodesk.com/view/IWICMS/2025/ENU/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>ICM Help</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </motion.nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:bg-secondary/80"
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                  {link.label}
                </a>
              ))}
              <a
                href="https://help.autodesk.com/view/IWICMS/2025/ENU/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span>ICM Help</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
