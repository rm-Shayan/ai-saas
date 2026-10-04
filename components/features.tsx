import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Brain, Shield } from "lucide-react";

export default function Features() {
  const items = [
    {
      icon: <Brain className="w-9 h-9 text-primary" />,
      title: "AI Investment Advisor",
      text: "Get personalized investment suggestions based on deep AI analysis."
    },
    {
      icon: <LineChart className="w-9 h-9 text-primary" />,
      title: "Startup Insights",
      text: "Analyze early-stage startups, products, and market trends."
    },
    {
      icon: <Shield className="w-9 h-9 text-primary" />,
      title: "Risk Evaluation",
      text: "Receive risk scores and safety suggestions before investing."
    }
  ];

  return (
    <section id="features" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            KEY FEATURES
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need to invest smarter</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From startup evaluation to product insights, InvestoCrafy gives you an AI co-pilot for investment decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-10 md:mt-12">
          {items.map((f, i) => (
            <Card key={i} className="group shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                  {f.icon}
                </div>
                <h4 className="text-lg font-semibold mt-4">{f.title}</h4>
                <p className="text-muted-foreground mt-2 leading-relaxed">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
