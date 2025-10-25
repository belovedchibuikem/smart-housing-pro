export default function LandPropertiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Land Properties</h1>
        <p className="text-muted-foreground">Browse available land for purchase</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select className="rounded-md border px-4 py-2">
          <option>All Locations</option>
          <option>Abuja</option>
          <option>Lagos</option>
          <option>Port Harcourt</option>
        </select>
        <select className="rounded-md border px-4 py-2">
          <option>All Sizes</option>
          <option>Under 500 sqm</option>
          <option>500 - 1000 sqm</option>
          <option>Above 1000 sqm</option>
        </select>
        <select className="rounded-md border px-4 py-2">
          <option>All Prices</option>
          <option>Under ₦5M</option>
          <option>₦5M - ₦10M</option>
          <option>Above ₦10M</option>
        </select>
      </div>

      {/* Land Listings */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "Residential Plot",
            location: "Abuja (Apo District)",
            size: "700 sqm",
            price: "₦8,500,000",
            pricePerSqm: "₦12,143",
            status: "Available",
          },
          {
            name: "Commercial Land",
            location: "Lagos (Lekki)",
            size: "1200 sqm",
            price: "₦18,000,000",
            pricePerSqm: "₦15,000",
            status: "Available",
          },
          {
            name: "Estate Plot",
            location: "Port Harcourt",
            size: "500 sqm",
            price: "₦5,000,000",
            pricePerSqm: "₦10,000",
            status: "Few Left",
          },
        ].map((land, index) => (
          <div key={index} className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{land.name}</h3>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                {land.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{land.location}</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">{land.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per sqm</span>
                <span className="font-medium">{land.pricePerSqm}</span>
              </div>
            </div>
            <p className="text-xl font-bold text-primary mb-4">{land.price}</p>
            <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
