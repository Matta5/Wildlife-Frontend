export default function ProfileImage({ src, alt = "Profile picture", size = "md", className = "" }) {
    // Define size mappings (actual rendered size in pixels)
    const sizes = {
        sm: 64,  // 16 * 4 (Tailwind h-16)
        md: 96,  // 24 * 4 (Tailwind h-24)
        lg: 128  // 32 * 4 (Tailwind h-32)
    };

    const actualSize = sizes[size] || sizes.md;
    
    return (
        <img
            src={src}
            alt={alt}
            width={actualSize}
            height={actualSize}
            loading="lazy"
            decoding="async"
            className={`object-cover ${className}`}
            style={{
                // Ensure the image is displayed at the correct size
                width: `${actualSize}px`,
                height: `${actualSize}px`
            }}
        />
    );
} 