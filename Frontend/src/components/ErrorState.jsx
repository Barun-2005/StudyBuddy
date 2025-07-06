const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-base-100 rounded-xl shadow-lg">
      <div className="text-error mb-4">
        <XCircle className="h-16 w-16" />
      </div>
      <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
      <p className="text-base-content/70 mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary gap-2">
          <RefreshCw className="h-5 w-5" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;