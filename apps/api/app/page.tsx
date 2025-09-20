export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Raypx API Server</h1>
          <p className="text-gray-600 mb-6">Welcome to the Raypx platform API</p>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Version:</span>
              <span className="text-gray-900">v1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Environment:</span>
              <span className="text-gray-900">{process.env.NODE_ENV || "development"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className="text-green-600">Running</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Links</h2>
            <div className="space-y-2">
              <a
                href="/api"
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                API Info
              </a>
              <a
                href="/health"
                className="block w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Health Check
              </a>
              <a
                href="https://docs.raypx.com/api"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Documentation ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
