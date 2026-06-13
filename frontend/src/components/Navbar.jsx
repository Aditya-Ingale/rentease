import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-700">🏠 RentEase</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <Link
              to="/properties"
              className="text-gray-600 hover:text-blue-700 font-medium transition-colors"
            >
              Search
            </Link>

            {token ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Hi, {user.name?.split(' ')[0]}
                </span>
                {user.role === 'LANDLORD' && (
                  <Link
                    to="/landlord/dashboard"
                    className="text-gray-600 hover:text-blue-700 font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-700 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg
                             hover:bg-blue-800 transition-colors font-medium text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar