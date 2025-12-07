import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Brain, Shield } from "lucide-react";

export default function Features() {
  const items = [
    {
      icon: <Brain className="w-10 h-10 text-blue-600" />,
      title: "AI Investment Advisor",
      text: "Get personalized investment suggestions based on deep AI analysis."
    },
    {
      icon: <LineChart className="w-10 h-10 text-blue-600" />,
      title: "Startup Insights",
      text: "Analyze early-stage startups, products, and market trends."
    },
    {
      icon: <Shield className="w-10 h-10 text-blue-600" />,
      title: "Risk Evaluation",
      text: "Receive risk scores and safety suggestions before investing."
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center">Key Features</h3>

        <div className="grid md:grid-cols-3 gap-8 mt-10">
          {items.map((f, i) => (
            <Card key={i} className="shadow-md hover:shadow-lg transition">
              <CardContent className="p-6 text-center">
                {f.icon}
                <h4 className="text-xl font-semibold mt-4">{f.title}</h4>
                <p className="text-gray-600 mt-2">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
