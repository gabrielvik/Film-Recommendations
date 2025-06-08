function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            CinematIQ
          </h1>
          <p className="text-xl text-gray-300 mt-2">
            Your Modern Movie Discovery Platform
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">
              ✅ Project Foundation Setup Complete!
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Frontend Stack</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• React 19</li>
                  <li>• TypeScript</li>
                  <li>• Vite Build Tool</li>
                  <li>• Tailwind CSS</li>
                </ul>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-300 mb-2">Development Tools</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• ESLint</li>
                  <li>• Prettier</li>
                  <li>• TypeScript Strict Mode</li>
                  <li>• Hot Module Replacement</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-center text-green-300">
                🚀 Ready for [FE-002] Bulletproof React Architecture Setup
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
