export default function HowItWorks() {
  const steps = [
    "Submit your startup or investment idea.",
    "AI analyzes the product, market, competition, and risk.",
    "Get a full recommendation with insights.",
  ];

  return (
    <section id="how" className="py-20 bg-blue-50">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h3 className="text-3xl font-bold">How It Works</h3>

        <div className="mt-10 space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="text-lg font-medium text-gray-700">
              <span className="text-blue-600 font-bold mr-2">{i + 1}.</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
