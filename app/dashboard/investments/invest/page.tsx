export default function InvestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Make an Investment</h1>
        <p className="text-muted-foreground">Choose an investment plan and start investing</p>
      </div>

      {/* Investment Options */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            type: "Money",
            title: "Cash Investment",
            description: "Invest cash in cooperative projects",
            minAmount: "₦100,000",
            roi: "15% annually",
          },
          {
            type: "Land",
            title: "Land Investment",
            description: "Invest in land development projects",
            minAmount: "₦500,000",
            roi: "20% annually",
          },
          {
            type: "House",
            title: "Housing Investment",
            description: "Invest in housing construction projects",
            minAmount: "₦1,000,000",
            roi: "25% annually",
          },
        ].map((option) => (
          <div key={option.type} className="rounded-lg border bg-card p-6 hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Minimum</span>
                <span className="text-sm font-medium">{option.minAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expected ROI</span>
                <span className="text-sm font-medium text-green-600">{option.roi}</span>
              </div>
            </div>
            <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Invest Now
            </button>
          </div>
        ))}
      </div>

      {/* Active Investment Plans */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Active Investment Plans</h2>
        <div className="space-y-4">
          {[
            {
              name: "Housing Project 2024",
              type: "House",
              amount: "₦2,000,000",
              roi: "25%",
              status: "Active",
              closingDate: "Dec 31, 2024",
            },
            {
              name: "Land Development Phase 2",
              type: "Land",
              amount: "₦1,500,000",
              roi: "20%",
              status: "Active",
              closingDate: "Nov 30, 2024",
            },
          ].map((plan, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Type: {plan.type} • Closes: {plan.closingDate}
                </p>
              </div>
              <div className="text-right mr-4">
                <p className="font-medium">{plan.amount}</p>
                <p className="text-sm text-green-600">ROI: {plan.roi}</p>
              </div>
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Invest More
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
