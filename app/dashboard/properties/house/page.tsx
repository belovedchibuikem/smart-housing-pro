export default function HousePropertiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">House Properties</h1>
        <p className="text-muted-foreground">Browse available houses for purchase</p>
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
          <option>All Prices</option>
          <option>Under ₦10M</option>
          <option>₦10M - ₦20M</option>
          <option>Above ₦20M</option>
        </select>
        <select className="rounded-md border px-4 py-2">
          <option>All Bedrooms</option>
          <option>2 Bedrooms</option>
          <option>3 Bedrooms</option>
          <option>4+ Bedrooms</option>
        </select>
      </div>

      {/* House Listings */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "3 Bedroom Bungalow",
            location: "Abuja",
            price: "₦15,000,000",
            bedrooms: 3,
            bathrooms: 2,
            image: "/modern-apartment-exterior.png",
          },
          {
            name: "4 Bedroom Duplex",
            location: "Lagos",
            price: "₦25,000,000",
            bedrooms: 4,
            bathrooms: 3,
            image: "/modern-living-room.png",
          },
          {
            name: "2 Bedroom Flat",
            location: "Port Harcourt",
            price: "₦8,500,000",
            bedrooms: 2,
            bathrooms: 2,
            image: "/modern-kitchen.png",
          },
        ].map((house, index) => (
          <div key={index} className="rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow">
            <img src={house.image || "/placeholder.svg"} alt={house.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{house.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{house.location}</p>
              <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                <span>{house.bedrooms} Beds</span>
                <span>{house.bathrooms} Baths</span>
              </div>
              <p className="text-xl font-bold text-primary mb-3">{house.price}</p>
              <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
