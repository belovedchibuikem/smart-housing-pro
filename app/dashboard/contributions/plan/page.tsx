export default function ContributionPlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contribution Plan</h1>
        <p className="text-muted-foreground">View and manage your contribution plan settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan Type</p>
              <p className="text-lg font-medium">Monthly Contribution</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-lg font-medium">₦50,000.00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Frequency</p>
              <p className="text-lg font-medium">Monthly</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="text-lg font-medium">January 1, 2024</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Plan Statistics */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Plan Statistics</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Contributions</p>
              <p className="text-lg font-medium">₦600,000.00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Months Active</p>
              <p className="text-lg font-medium">12 months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Payment</p>
              <p className="text-lg font-medium">January 1, 2025</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-lg font-medium">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "Basic Plan", amount: "₦25,000", frequency: "Monthly" },
            { name: "Standard Plan", amount: "₦50,000", frequency: "Monthly" },
            { name: "Premium Plan", amount: "₦100,000", frequency: "Monthly" },
          ].map((plan) => (
            <div key={plan.name} className="rounded-lg border p-4 hover:border-primary transition-colors">
              <h3 className="font-semibold mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-primary mb-1">{plan.amount}</p>
              <p className="text-sm text-muted-foreground mb-4">{plan.frequency}</p>
              <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Switch to Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
