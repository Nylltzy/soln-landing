import { cx } from '../lib/cx'
import { brand } from '../content'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        'depth relative grid size-[20px] shrink-0 place-items-center rounded-[7px] bg-gradient-to-br from-[#131c2e] to-[#0b1220] [--depth-edge:rgb(226_234_248/0.22)]',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[12.5px]" fill="none" stroke="url(#logo-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="logo-g" gradientUnits="userSpaceOnUse" x1="6.5" y1="0" x2="17.5" y2="0">
            <stop offset="0" stopColor="#5ce0c8" />
            <stop offset="1" stopColor="#7cb8e6" />
          </linearGradient>
        </defs>
        <path d="M6.5 14.5 12 7l5.5 7.5" />
        <circle cx="12" cy="18.4" r="1.35" fill="#5ce0c8" stroke="none" />
      </svg>
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#" className={cx('inline-flex items-center gap-2 text-[16px] font-bold tracking-tight text-fg', className)}>
      <LogoMark />
      {brand.name}
    </a>
  )
}
