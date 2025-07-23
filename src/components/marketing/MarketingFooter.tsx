import { Link } from "react-router-dom";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";

const footerLinks = [
  {
    title: "Company",
    links: [
      { name: "About", href: "/" },
      { name: "Press / Media Kit", href: "/press" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Technical",
    links: [
      { name: "Security & Infrastructure", href: "/docs#security" },
    ],
  },
  {
    title: "Contact",
    links: [
      { name: "hello@feasly.com", href: "mailto:hello@feasly.com" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Feasly
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Next-gen real estate financial modeling platform, 
              built for the GCC and beyond.
            </p>
            <div className="max-w-xs">
              <WaitlistForm 
                placeholder="Your email"
                buttonText="Join Waitlist"
                size="sm"
                className="flex-col gap-2"
              />
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-medium">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('mailto:') || link.href.startsWith('http') || link.href.includes('#') ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Feasly Technologies. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#linkedin" className="text-muted-foreground hover:text-foreground">
              LinkedIn
            </a>
            <a href="#twitter" className="text-muted-foreground hover:text-foreground">
              Twitter
            </a>
            <a href="#github" className="text-muted-foreground hover:text-foreground">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}