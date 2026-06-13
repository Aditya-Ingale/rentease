const BADGE_CONFIG = {
  FAIR_DEAL: {
    label: 'Fair Deal',
    description: 'Priced within AI estimated range',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: '✅'
  },
  GREAT_VALUE: {
    label: 'Great Value',
    description: 'Priced below AI estimated range',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: '🔵'
  },
  ABOVE_MARKET: {
    label: 'Above Market',
    description: 'Priced above AI estimated range',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: '⚠️'
  },
}

function AiBadge({ badge, minRent, maxRent, suggested, size = 'normal' }) {
  const config = BADGE_CONFIG[badge]
  if (!config) return null

  const formatRent = (rent) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(rent)

  if (size === 'small') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1
                       rounded-full text-xs font-semibold
                       ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    )
  }

  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className={`font-bold text-base ${config.text}`}>
          AI Rent Analysis — {config.label}
        </span>
      </div>
      <p className={`text-sm mb-3 ${config.text}`}>{config.description}</p>

      {minRent && maxRent && (
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-2">
            AI Estimated Fair Rent Range:
          </p>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-400">Min</p>
              <p className="font-semibold text-gray-700 text-sm">
                {formatRent(minRent)}
              </p>
            </div>
            <div className="flex-1 mx-3 h-1 bg-gray-200 rounded">
              <div className="h-full bg-blue-400 rounded w-1/2 mx-auto" />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Suggested</p>
              <p className="font-semibold text-blue-700 text-sm">
                {formatRent(suggested)}
              </p>
            </div>
            <div className="flex-1 mx-3 h-1 bg-gray-200 rounded">
              <div className="h-full bg-blue-400 rounded w-1/2 mx-auto" />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Max</p>
              <p className="font-semibold text-gray-700 text-sm">
                {formatRent(maxRent)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AiBadge