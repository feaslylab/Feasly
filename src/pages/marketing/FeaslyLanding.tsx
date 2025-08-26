import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart3, PieChart, TrendingUp, Users, Shield, Zap } from 'lucide-react';
import { PATHS } from '@/routes/paths';

export default function FeaslyLanding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    // Navigate to auth page for new users
    navigate(PATHS.auth);
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Financial Modeling',
      description: 'Create detailed financial models with cash flow analysis, IRR calculations, and scenario planning.'
    },
    {
      icon: PieChart,
      title: 'Portfolio Management', 
      description: 'Manage multiple projects in portfolios with customizable weighting and aggregation rules.'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Track KPIs, benchmark performance, and generate comprehensive reports and insights.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Collaborate with team members, share projects, and manage organizational workflows.'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with role-based access and audit trails for compliance.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant updates, automated calculations, and live collaboration features.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Feasly</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to={PATHS.auth} className="text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button onClick={handleGetStarted} disabled={isLoading}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Financial Modeling & 
            <span className="text-primary"> Portfolio Management</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create sophisticated financial models, manage investment portfolios, and make data-driven decisions with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Start Free Trial'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need for financial analysis
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From individual project modeling to complex portfolio management, Feasly provides the tools you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust Feasly for their financial modeling and portfolio management needs.
          </p>
          <Button size="lg" onClick={handleGetStarted} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Start Your Free Trial'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">Feasly</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2024 Feasly. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}