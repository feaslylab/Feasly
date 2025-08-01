import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { TM } from "@/components/ui/trademark";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const getNavLinks = (t: (key: string) => string) => [
  { name: t('nav.features'), href: "#features", isAnchor: true },
  { name: "Comparison", href: "/comparison", isAnchor: false },
  { name: t('nav.demo'), href: "#demo", isAnchor: true },
  { name: t('nav.pricing'), href: "/pricing", isAnchor: false },
  { name: t('nav.docs'), href: "/docs", isAnchor: false },
];

const handleAnchorClick = (href: string, setMobileMenuOpen?: (open: boolean) => void) => {
  if (href.startsWith('#')) {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen?.(false);
  }
};

export function MarketingHeader() {
  const { t } = useTranslation('marketing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = getNavLinks(t);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 10);
      
      // Animate height based on scroll
      const header = document.querySelector('[data-header]') as HTMLElement;
      if (header) {
        if (scrollY > 40) {
          header.style.height = '60px';
        } else {
          header.style.height = '80px';
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <ScrollProgress />
      <header
        data-header
        className={cn(
          "sticky top-0 w-full z-50 backdrop-blur-sm bg-background/95 border-b border-border transition-all duration-300",
          scrolled ? "shadow-sm" : ""
        )}
        style={{ height: '80px' }}
      >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/4b3d51a1-21a0-4d40-a32f-16a402b2a939.png" 
              alt="Feasly Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-3xl md:text-4xl font-bold text-primary-dark">
              Feasly<TM />
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => 
            link.isAnchor ? (
              <button
                key={link.name}
                onClick={() => handleAnchorClick(link.href)}
                className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
              >
                {link.name}
              </button>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            )
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button asChild>
            <Link to="/welcome">{t('nav.login')}</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden space-x-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t('common.toggleMenu')}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-md shadow-lg border-t border-border pb-4">
          <nav className="flex flex-col space-y-4 p-4">
            {navLinks.map((link) => 
              link.isAnchor ? (
                <button
                  key={link.name}
                  onClick={() => handleAnchorClick(link.href, setMobileMenuOpen)}
                  className="text-base font-medium hover:text-primary transition-colors py-2 text-left"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-base font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            )}
            <div className="flex flex-col space-y-3 pt-2">
              <Button asChild className="w-full">
                <Link to="/welcome" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.login')}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
      </header>
    </>
  );
}