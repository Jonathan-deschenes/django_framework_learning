import { getInitials } from '../lib/format'

interface ProductImageProps {
  product: { id: number; name: string }
  className?: string
}

export function ProductImage({ product, className = '' }: ProductImageProps) {
  const hue = (product.id * 47) % 360
  const background = `linear-gradient(135deg, hsl(${hue} 82% 93%), hsl(${(hue + 42) % 360} 68% 78%))`

  return (
    <div
      role="img"
      aria-label={`Image de ${product.name}`}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background }}
    >
      <span className="absolute -right-6 -top-8 size-24 rounded-full bg-white/35 blur-2xl" />
      <span className="absolute -bottom-10 -left-8 size-28 rounded-full bg-white/25 blur-2xl" />
      <span className="relative flex size-16 items-center justify-center rounded-2xl bg-white/70 text-2xl font-semibold text-slate-700 shadow-sm backdrop-blur">
        {getInitials(product.name)}
      </span>
    </div>
  )
}
