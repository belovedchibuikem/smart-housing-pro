import { z } from "zod"

export const marketplaceInquirySchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Valid email required").max(190),
  phone: z.string().min(7).max(32).optional().or(z.literal("")),
  message: z.string().min(5, "Message is required").max(2000),
})

export const marketplaceViewingSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  phone: z.string().min(7).max(32).optional().or(z.literal("")),
  preferred_at: z.string().min(1, "Preferred date/time required"),
  notes: z.string().max(1000).optional().or(z.literal("")),
})

export const marketplaceFiltersSchema = z.object({
  q: z.string().optional(),
  listing_kind: z.string().optional(),
  listing_type: z.string().optional(),
  listing_category: z.string().optional(),
  listing_purpose: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  lga: z.string().optional(),
  min_price: z.union([z.string(), z.number()]).optional(),
  max_price: z.union([z.string(), z.number()]).optional(),
  bedrooms: z.union([z.string(), z.number()]).optional(),
  bathrooms: z.union([z.string(), z.number()]).optional(),
  parking: z.union([z.string(), z.number()]).optional(),
  vendor_slug: z.string().optional(),
  sort: z.string().optional(),
  lat: z.union([z.string(), z.number()]).optional(),
  lng: z.union([z.string(), z.number()]).optional(),
  radius_km: z.union([z.string(), z.number()]).optional(),
  min_trust_score: z.union([z.string(), z.number()]).optional(),
  page: z.number().optional(),
  per_page: z.number().optional(),
})

export const fraudReportSchema = z.object({
  reason: z.string().min(3).max(128),
  details: z.string().max(5000).optional(),
  reporter_email: z.string().email().optional().or(z.literal("")),
})

export type MarketplaceInquiryInput = z.infer<typeof marketplaceInquirySchema>
export type MarketplaceViewingInput = z.infer<typeof marketplaceViewingSchema>
export type FraudReportInput = z.infer<typeof fraudReportSchema>
