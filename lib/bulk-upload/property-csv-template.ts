/**
 * Default properties bulk upload CSV (kept in sync with
 * App\Http\Controllers\Api\Admin\BulkPropertyController::downloadTemplate).
 * Used as offline fallback if the API template request fails.
 */
export const PROPERTY_BULK_UPLOAD_CSV = `Title,Description,Location,Address,City,State,Property Type,Price,Size (sqft),Bedrooms,Bathrooms,Total Slots,Status (available/reserved/sold),Features (comma-separated)
3 Bedroom Duplex,Beautiful 3 bedroom duplex in a prime location,"Wuse, Abuja","123 Main Street, Wuse",Abuja,FCT,Duplex,15000000,3500,3,3,50,available,"Swimming Pool,Gym,Parking"
2 Bedroom Apartment,Modern apartment with great amenities,"Victoria Island, Lagos","456 Victoria Island, Lagos",Lagos,Lagos,Apartment,8500000,1800,2,2,30,available,"Elevator,Security,Generator"
`
