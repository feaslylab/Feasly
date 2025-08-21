import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  FileBarChart2, 
  Shield, 
  LineChart, 
  Play, 
  Calendar,
  Globe,
  CheckCircle,
  ArrowRight,
  Building2,
  Users,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CORE_MODULES = [
  {
    icon: Calculator,
    title: 'Financial Modeling',
    description: 'Precision-grade feasibility engine with real assumptions for GCC markets'
  },
  {
    icon: TrendingUp,
    title: 'Revenue Preview',
    description: 'Dynamic revenue curves for sale/rent assets with market validation'
  },
  {
    icon: FileBarChart2,
    title: 'Executive Reports',
    description: 'Board-ready exports with IRR, Sources & Uses, and comprehensive analytics'
  },
  {
    icon: Shield,
    title: 'Approvals Workflow',
    description: 'Lock scenarios with full audit trail and governance controls'
  },
  {
    icon: LineChart,
    title: 'Feasly Insights',
    description: 'Market benchmarks from RERA, MEED, Knight Frank and other trusted sources'
  }
];

const GCC_FEATURES = [
  'Arabic language & RTL support',
  'Zakat and VAT calculations',
  'Local currency support (AED, SAR, KWD)',
  'GCC-specific development patterns',
  'Regional regulatory compliance'
];

const TRUST_INDICATORS = [
  'Trusted by regional developers',
  'Sovereign entity partnerships',
  'Advisory firm integrations',
  'Real estate consultancy adoption'
];

export default function FeaslyLanding() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleTryDemo = () => {
    navigate('/demo');
  };

  const handleScheduleWalkthrough = () => {
    // Future implementation - could open calendar modal or redirect to booking
    console.log('Schedule walkthrough clicked');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Future implementation - send to backend
    console.log('Contact form submitted:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-gate font-bold text-xl">Feasly™</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleTryDemo}>
              Demo
            </Button>
            <Button onClick={handleTryDemo}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <Badge variant="secondary" className="mb-4">
            GCC-Native Financial Modeling Platform
          </Badge>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Model the Future.{' '}
            <span className="text-primary">Manage with Precision.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-8">
            GCC-first feasibility software for real estate developers, advisors, and sovereign stakeholders. 
            Built for regional markets with local expertise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleTryDemo}
              className="flex items-center gap-2"
            >
              <Play className="h-5 w-5" />
              Try the Demo
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleScheduleWalkthrough}
              className="flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Schedule a Walkthrough
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            No sign-up required for demo • Full access in seconds
          </p>
        </div>
      </section>

      {/* Core Modules */}
      <section className="container py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Complete Feasibility Platform</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From initial modeling to board presentations, manage your entire development lifecycle
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_MODULES.map((module, index) => {
              const Icon = module.icon;
              return (
                <Card key={index} className="relative group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{module.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* GCC Localization Advantage */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  Built in GCC, for GCC
                </Badge>
                <h2 className="text-3xl font-bold mb-6">
                  Regional Expertise, Global Standards
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Purpose-built for GCC markets with local regulations, currencies, and development patterns at its core.
                </p>
                
                <div className="space-y-4">
                  {GCC_FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="mt-8" onClick={handleTryDemo}>
                  Experience the Difference
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative">
                <Card className="p-6">
                  <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Arabic UI & RTL Support Preview
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Mode */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Preview Your Next Feasibility in Seconds</h2>
          <p className="text-xl text-muted-foreground mb-8">
            No barriers to entry. Experience the full platform with realistic sample data.
          </p>
          
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">Instant Demo Access</h3>
                <p className="text-muted-foreground">
                  Explore all features with pre-loaded project scenarios from across the GCC region.
                </p>
              </div>
              <Button size="lg" onClick={handleTryDemo} className="flex-shrink-0">
                <Play className="mr-2 h-5 w-5" />
                Launch Demo
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-muted/20 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Trusted by Regional Leaders
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Supporting feasibility decisions across the GCC real estate ecosystem
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_INDICATORS.map((indicator, index) => (
                <Card key={index} className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="font-medium">{indicator}</p>
                </Card>
              ))}
            </div>
            
            <div className="mt-12 flex justify-center items-center gap-8 opacity-60">
              {/* Placeholder for customer logos */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-24 h-12 bg-muted rounded flex items-center justify-center">
                  <Award className="h-6 w-6 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="mx-auto max-w-4xl p-8 text-center bg-gradient-to-r from-primary/10 to-primary/5">
          <h2 className="text-3xl font-bold mb-4">Ready to Model with Precision?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join regional developers who trust Feasly for their most critical feasibility decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleTryDemo}>
              Start Free Demo
            </Button>
            <Button variant="outline" size="lg" onClick={handleScheduleWalkthrough}>
              Schedule Consultation
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Feasly</span>
              </div>
              <p className="text-muted-foreground mb-4">
                GCC-native financial modeling platform for real estate development.
              </p>
              <p className="text-sm text-muted-foreground">
                © 2024 Feasly Technologies FZCO. All rights reserved.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={handleTryDemo} className="hover:text-foreground">Demo</button></li>
                <li><button onClick={handleTryDemo} className="hover:text-foreground">Features</button></li>
                <li><button className="hover:text-foreground">Pricing</button></li>
                <li><button className="hover:text-foreground">API</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground">About</button></li>
                <li><button className="hover:text-foreground">Contact</button></li>
                <li><button className="hover:text-foreground">Privacy Policy</button></li>
                <li><button className="hover:text-foreground">Terms of Service</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}