import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="inline animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-xl text-gray-700">Loading portfolio data...</p>
      </div>
    </div>
  );
}
