const LoadingSpinner = ({ size = "md", message = "Loading..." }) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8", 
        lg: "h-12 w-12"
    };

    return (
        <div className="text-center py-8">
            <div className={`animate-spin rounded-full border-b-2 border-blue-500 mx-auto ${sizeClasses[size]}`}></div>
            {message && <p className="text-gray-400 mt-2">{message}</p>}
        </div>
    );
};

export default LoadingSpinner; 