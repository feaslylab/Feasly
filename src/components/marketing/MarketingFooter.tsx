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
        <div className="grid grid-cols-2 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Feasly
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Model the future. Manage with precision.
            </p>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:hello@feasly.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  hello@feasly.com
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <div className="text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Feasly. Model the future. Manage with precision.</p>
            <p className="text-xs mt-1">Feasly Technologies (DIFC) Ltd</p>
            <p className="text-xs">Registered office: Unit GA, Level 1 Gate Avenue - South Zone, DIFC</p>
          </div>
        </div>
      </div>
    </footer>
  );
}