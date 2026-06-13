import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AiBadge from '../components/AiBadge'
import MoveInCalculator from '../components/MoveInCalculator'
import { mockProperties, mockReviews } from '../data/mockData'
import { propertyApi } from '../api/propertyApi'

const USE_MOCK = true

const FURNISH_LABELS = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi-Furnished',
  UNFURNISHED: 'Unfurnished',
}

const AMENITY_ICONS = {
  wifi: '📶', parking: '🅿️', gym: '🏋️', pool: '🏊',
  power: '⚡', security: '🔒', lift: '🛗', ac: '❄️',
  water: '💧', gas: '🔥', housekeeping: '🧹', cctv: '📹',
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-200'}>
          ★
        </span>
      ))}
    </div>
  )
}

function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    setLoading(true)
    try {
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 400))
        const found = mockProperties.find(p => p.id === Number(id))
        setProperty(found || mockProperties[0])
        setReviews(mockReviews)
      } else {
        const res = await propertyApi.getById(id)
        setProperty(res.data)
        setReviews([]) // reviews API comes Day 8
      }
    } catch (err) {
      console.error('Failed to fetch property:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatRent = (rent) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(rent)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-80 bg-gray-200 rounded-xl mb-6" />
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏠</p>
          <h3 className="text-lg font-semibold text-gray-700">Property not found</h3>
          <button
            onClick={() => navigate('/properties')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-700
                     mb-4 transition-colors"
        >
          ← Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Photo Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-80">
                <img
                  src={property.imageUrls?.[activeImage]
                    || 'https://via.placeholder.com/800x600?text=No+Image'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {property.imageUrls?.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage(prev =>
                        prev === 0 ? property.imageUrls.length - 1 : prev - 1
                      )}
                      className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-8 h-8 bg-white/80 rounded-full flex items-center
                                 justify-center shadow hover:bg-white"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setActiveImage(prev =>
                        prev === property.imageUrls.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 w-8 h-8 bg-white/80 rounded-full flex items-center
                                 justify-center shadow hover:bg-white"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2
                                    flex gap-1">
                      {property.imageUrls.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === activeImage ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {property.imageUrls?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {property.imageUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-12 object-cover rounded cursor-pointer
                                 flex-shrink-0 transition-all ${
                        i === activeImage
                          ? 'ring-2 ring-blue-500'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-800 mb-1">
                    {property.title}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    📍 {property.locality}, {property.city}
                  </p>
                </div>
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  {wishlisted ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { icon: '🛏', label: 'BHK', value: `${property.bhk} BHK` },
                  { icon: '📐', label: 'Size', value: `${property.sqft} sqft` },
                  { icon: '🏢', label: 'Floor', value: `${property.floor} of ${property.totalFloors}` },
                  { icon: '🛋', label: 'Furnishing', value: FURNISH_LABELS[property.furnishingStatus] },
                ].map(stat => (
                  <div key={stat.label}
                       className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg mb-1">{stat.icon}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    About this property
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Amenities</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {property.amenities.map(amenity => (
                    <div key={amenity.id}
                         className="flex items-center gap-2 bg-gray-50
                                    rounded-lg p-2">
                      <span className="text-lg">
                        {AMENITY_ICONS[amenity.icon] || '✓'}
                      </span>
                      <span className="text-xs text-gray-700 font-medium">
                        {amenity.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Badge */}
            {property.aiDealBadge && (
              <AiBadge
                badge={property.aiDealBadge}
                minRent={property.aiMinRent}
                maxRent={property.aiMaxRent}
                suggested={property.aiSuggestedRent}
              />
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  Reviews
                </h3>
                {property.averageRating && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(property.averageRating)} />
                    <span className="font-semibold text-gray-800">
                      {property.averageRating}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({property.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No reviews yet
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id}
                         className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800 text-sm">
                          {review.tenantName}
                        </span>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-4">

            {/* Rent + Actions Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm sticky top-24">
              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-700">
                  {formatRent(property.rent)}
                </span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>

              {/* Landlord info */}
              <div className="flex items-center gap-3 mb-5 p-3
                              bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full
                                flex items-center justify-center
                                font-bold text-blue-700">
                  {property.landlord?.name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {property.landlord?.name}
                  </p>
                  <p className="text-xs text-gray-500">Property Owner</p>
                </div>
              </div>

              {/* Action buttons */}
              <button
                onClick={() => navigate(`/booking/${property.id}/confirm`)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg
                           font-semibold hover:bg-blue-700 transition-colors mb-3"
              >
                Request Booking
              </button>

              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`w-full py-3 rounded-lg font-semibold
                           border transition-colors ${
                  wishlisted
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                }`}
              >
                {wishlisted ? '❤️ Saved' : '🤍 Save to Wishlist'}
              </button>
            </div>

            {/* Move-In Calculator */}
            <MoveInCalculator rent={property.rent} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetail