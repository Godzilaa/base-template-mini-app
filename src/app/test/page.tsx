import ContractChecker from '~/components/ContractChecker';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">BaseReviews Contract Testing</h1>
        <ContractChecker />
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            This page helps verify that your BaseReviews smart contract is properly deployed and accessible.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </a>
            <a 
              href="/business" 
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Business Dashboard
            </a>
            <a 
              href="/gigs" 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Worker Gigs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}