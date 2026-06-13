import { useState } from 'react'

function MoveInCalculator({ rent }) {
  const [depositMonths, setDepositMonths] = useState(2)
  const [includeBrokerage, setIncludeBrokerage] = useState(false)

  const deposit = rent * depositMonths
  const brokerage = includeBrokerage ? rent : 0
  const total = deposit + rent + brokerage

  const formatRent = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)

  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
      <h3 className="font-semibold text-gray-800 mb-3">
        💰 Move-In Cost Calculator
      </h3>

      {/* Deposit slider */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Security Deposit</span>
          <span className="font-medium text-blue-700">
            {depositMonths} months = {formatRent(deposit)}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="6"
          value={depositMonths}
          onChange={(e) => setDepositMonths(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 month</span>
          <span>6 months</span>
        </div>
      </div>

      {/* Brokerage toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">Include Brokerage (1 month)</span>
        <button
          onClick={() => setIncludeBrokerage(!includeBrokerage)}
          className={`w-10 h-5 rounded-full transition-colors ${
            includeBrokerage ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5
                          ${includeBrokerage ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Security Deposit ({depositMonths}mo)
          </span>
          <span className="font-medium">{formatRent(deposit)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">First Month Rent</span>
          <span className="font-medium">{formatRent(rent)}</span>
        </div>
        {includeBrokerage && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Brokerage (1 month)</span>
            <span className="font-medium">{formatRent(brokerage)}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between">
          <span className="font-semibold text-gray-800">Total Upfront Cost</span>
          <span className="font-bold text-blue-700 text-lg">
            {formatRent(total)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default MoveInCalculator