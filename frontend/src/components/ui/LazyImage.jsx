import { useState } from 'react'
import { useLazyLoad } from '../../hooks/useLazyLoad'

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+',
  ...props 
}) => {
  const { ref, inView } = useLazyLoad()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const handleLoad = () => setLoaded(true)
  const handleError = () => setError(true)

  return (
    <div ref={ref} className={`lazy-image-container ${className}`}>
      {inView && (
        <img
          src={error ? placeholder : (loaded ? src : placeholder)}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          style={{
            transition: 'opacity 0.3s ease',
            opacity: loaded ? 1 : 0.7,
            aspectRatio: width && height ? `${width}/${height}` : 'auto'
          }}
          {...props}
        />
      )}
    </div>
  )
}

export default LazyImage