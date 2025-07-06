const LoadingSpinner = ({ size = "default", text = "Loading..." }) => {
  const sizeClasses = {
    small: "h-8 w-8",
    default: "h-16 w-16",
    large: "h-24 w-24"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${sizeClasses[size]}`}></div>
      <p className="mt-4 text-base-content/70">{text}</p>
    </div>
  );
};

export default LoadingSpinner;