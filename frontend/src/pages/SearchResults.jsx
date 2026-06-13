import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PropertyCard from '../components/PropertyCard'
import { mockProperties } from '../data/mockData'
import { propertyApi } from '../api/propertyApi'
import useListingStream from '../hooks/useListingStream'

const USE_MOCK = true

const CITIES = ['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Chennai']
const BHK_OPTIONS = [1, 2, 3, 4]
const FURNISH_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'FURNISHED', label: 'Furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
]
const TYPE_OPTIONS = [
  { value: '', label: 'Any Type' },
  { value: 'FLAT', label: 'Flat' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'INDEPENDENT_HOUSE', label: 'Independent House' },
]
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'rent_asc', label: 'Rent: Low to High' },
  { value: 'rent_desc', label: 'Rent: High to Low' },
]

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)

  // Filters state
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    bhk: searchParams.get('bhk') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    furnished: searchParams.get('furnished') || '',
    propertyType: searchParams.get('propertyType') || '',
    sortBy: 'newest',
  })

  // SSE — realtime new listings
  useListingStream((newListing) => {
    setProperties(prev => [newListing, ...prev])
    setTotalResults(prev => prev + 1)
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 500)) // simulate network delay
        let filtered = mockProperties
        if (filters.city) {
          filtered = filtered.filter(p =>
            p.city.toLowerCase() === filters.city.toLowerCase())
        }
        if (filters.bhk) {
          filtered = filtered.filter(p => p.bhk === Number(filters.bhk))
        }
        setProperties(filtered)
        setTotalResults(filtered.length)
      } else {
        const params = {}
        if (filters.city) params.city = filters.city
        if (filters.bhk) params.bhk = filters.bhk
        if (filters.minRent) params.minRent = filters.minRent
        if (filters.maxRent) params.maxRent = filters.maxRent
        if (filters.furnished) params.furnished = filters.furnished
        if (filters.propertyType) params.propertyType = filters.propertyType
        params.sortBy = filters.sortBy

        const res = await propertyApi.search(params)
        setProperties(res.data.content)
        setTotalResults(res.data.totalElements)
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    fetchProperties()
  }

  const handleClearFilters = () => {
    setFilters({
      city: '', bhk: '', minRent: '', maxRent: '',
      furnished: '', propertyType: '', sortBy: 'newest'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── FILTER SIDEBAR ── */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">Filters</h2>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>

              {/* City */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={e => handleFilterChange('city', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Cities</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* BHK */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BHK
                </label>
                <div className="flex gap-2 flex-wrap">
                  {BHK_OPTIONS.map(b => (
                    <button
                      key={b}
                      onClick={() => handleFilterChange(
                        'bhk', filters.bhk === String(b) ? '' : String(b)
                      )}
                      className={`px-3 py-1 rounded-lg text-sm font-medium
                                 border transition-colors ${
                        filters.bhk === String(b)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      {b} BHK
                    </button>
                  ))}
                </div>
              </div>

              {/* Rent Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent Range (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minRent}
                    onChange={e => handleFilterChange('minRent', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-2
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxRent}
                    onChange={e => handleFilterChange('maxRent', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-2
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Furnishing */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing
                </label>
                <select
                  value={filters.furnished}
                  onChange={e => handleFilterChange('furnished', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FURNISH_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.propertyType}
                  onChange={e => handleFilterChange('propertyType', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full bg-blue-600 text-white py-2 rounded-lg
                           font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* ── RESULTS ── */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600 text-sm">
                <span className="font-semibold text-gray-800">
                  {totalResults}
                </span> properties found
                {filters.city && ` in ${filters.city}`}
              </p>
              <select
                value={filters.sortBy}
                onChange={e => handleFilterChange('sortBy', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i}
                       className="bg-white rounded-xl h-72 animate-pulse border border-gray-100" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && properties.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🏠</p>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters or search in a different city
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Property Grid */}
            {!loading && properties.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default SearchResults