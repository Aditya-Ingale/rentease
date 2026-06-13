import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BADGE_CONFIG = {
  FAIR_DEAL: { label: 'Fair Deal', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  GREAT_VALUE: { label: 'Great Value', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  ABOVE_MARKET: { label: 'Above Market', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
}

const FURNISH_LABELS = {
  FURNISHED: { label: 'Furnished', color: 'text-green-600' },
  SEMI_FURNISHED: { label: 'Semi-Furnished', color: 'text-blue-600' },
  UNFURNISHED: { label: 'Unfurnished', color: 'text-gray-500' },
}

function PropertyCard({ property, onWishlistToggle, isWishlisted = false }) {
  const navigate = useNavigate()
  const [wishlisted, setWishlisted] = useState(isWishlisted)

  const badge = BADGE_CONFIG[property.aiDealBadge]
  const furnish = FURNISH_LABELS[property.furnishingStatus]

  const handleWishlist = (e) => {
    e.stopPropagation()
    setWishlisted(!wishlisted)
    onWishlistToggle?.(property.id)
  }

  const formatRent = (rent) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(rent)

  return (
    <div
      onClick={() => navigate(`/properties/${property.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100
                 hover:shadow-md hover:-translate-y-1 transition-all
                 duration-200 cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={property.imageUrls?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full
                     flex items-center justify-center shadow-sm
                     hover:scale-110 transition-transform"
        >
          <span className={wishlisted ? 'text-red-500' : 'text-gray-400'}>
            {wishlisted ? '❤️' : '🤍'}
          </span>
        </button>

        {/* AI Badge */}
        {badge && (
          <div className={`absolute bottom-3 left-3 flex items-center gap-1
                          px-2 py-1 rounded-full text-xs font-semibold
                          ${badge.bg} ${badge.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
          {property.title}
        </h3>
        <p className="text-gray-500 text-xs mb-3">
          📍 {property.locality}, {property.city}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span>🛏 {property.bhk} BHK</span>
          <span>📐 {property.sqft} sqft</span>
          <span>🏢 Floor {property.floor}</span>
        </div>

        {/* Furnishing */}
        <p className={`text-xs font-medium mb-3 ${furnish?.color}`}>
          {furnish?.label}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-blue-700">
              {formatRent(property.rent)}
            </span>
            <span className="text-xs text-gray-400">/month</span>
          </div>
          {property.averageRating && (
            <span className="text-xs bg-green-50 text-green-700
                           px-2 py-1 rounded-full font-medium">
              ⭐ {property.averageRating} ({property.totalReviews})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default PropertyCard