export const LISTING_CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "apartment", label: "Apartment" },
  { value: "duplex", label: "Duplex" },
  { value: "detached", label: "Detached" },
  { value: "semi-detached", label: "Semi Detached" },
  { value: "terrace", label: "Terrace" },
  { value: "hostel", label: "Hostel / Student" },
  { value: "short-let", label: "Short Let" },
  { value: "luxury", label: "Luxury" },
  { value: "office", label: "Office" },
  { value: "warehouse", label: "Warehouse" },
  { value: "shop", label: "Shop" },
  { value: "hotel", label: "Hotel" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "investment", label: "Investment" },
  { value: "auction", label: "Auction" },
  { value: "government", label: "Government" },
] as const

export const LISTING_PURPOSES = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "lease", label: "Lease" },
  { value: "auction", label: "Auction" },
  { value: "investment", label: "Investment" },
] as const

export type ListingCategory = (typeof LISTING_CATEGORIES)[number]["value"]
export type ListingPurpose = (typeof LISTING_PURPOSES)[number]["value"]
