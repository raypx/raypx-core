export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Raypx App</h1>

          <p className="text-gray-600 mb-8">
            Welcome to your Raypx application
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-2">
                Getting Started
              </h2>
              <p className="text-sm text-gray-600">
                This is your empty Raypx application. Start building amazing
                features!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 text-center bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0.1.0</div>
                <div className="text-xs text-blue-800">Version</div>
              </div>
              <div className="p-3 text-center bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Ready</div>
                <div className="text-xs text-green-800">Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
