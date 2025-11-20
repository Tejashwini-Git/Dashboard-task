import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-600" size={32} />
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
        </div>
        <p className="text-gray-700">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
