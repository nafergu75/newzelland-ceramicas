import { useState, useEffect, ImgHTMLAttributes } from 'react'

// SVG inline en vez de un fichero en public/: cero petición de red extra y
// nada que romper si el asset se mueve o se olvida en un deploy.
const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#e8e6e1"/>
      <g fill="none" stroke="#c4c0b8" stroke-width="2">
        <rect x="40" y="40" width="320" height="220" rx="4"/>
        <path d="M40 220 L150 130 L220 190 L280 110 L360 200"/>
        <circle cx="130" cy="90" r="18"/>
      </g>
    </svg>
  `)

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  src?: string
}

export default function ImageWithFallback({ src, alt, ...rest }: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  // Si cambia el src (ej. al navegar entre series), se reintenta con la
  // nueva URL en vez de quedarse pegado al placeholder de la anterior.
  useEffect(() => setError(false), [src])

  return (
    <img
      src={error || !src ? PLACEHOLDER : src}
      alt={alt}
      onError={() => setError(true)}
      {...rest}
    />
  )
}
