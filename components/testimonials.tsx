import { Card, CardContent } from "@/components/ui/card";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h3 className="text-3xl font-bold">What Investors Say</h3>

        <div className="grid md:grid-cols-3 gap-8 mt-10">
          {[1, 2, 3].map((_) => (
            <Card key={_} className="shadow">
              <CardContent className="p-6">
                <p className="text-gray-600">
                  “InvestoCrafy helped me understand the real potential of a startup before investing.”
                </p>
                <h4 className="mt-4 font-bold text-blue-600">Investor</h4>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
