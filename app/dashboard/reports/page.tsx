export default function ReportsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-2">View and download your financial and activity reports</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
          <p className="text-muted-foreground">Generate custom reports for your account</p>
        </div>
      </div>
    </div>
  )
}
