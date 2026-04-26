import Link from 'next/link';

export function BrandMark({
  dark = false,
  compact = false,
  iconClassName = '',
  textClassName = '',
}: {
  dark?: boolean;
  compact?: boolean;
  iconClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={`flex items-center ${compact ? '' : 'gap-3'}`}>
      <div className={`relative h-12 w-12 shrink-0 rounded-full bg-[#35d0ad] ${iconClassName}`}>
        <div className="absolute inset-[9px] rounded-full border-[8px] border-white border-r-transparent border-t-transparent rotate-45" />
        <div className="absolute right-[10px] top-[7px] h-4 w-4 rotate-45 bg-[#7ee5ce]" />
      </div>
      {!compact && (
        <div
          className={`text-[18px] font-extrabold leading-[0.95] ${dark ? 'text-white' : 'text-slate-700'} ${textClassName}`}
        >
          <div>HMS</div>
          <div>Alert</div>
        </div>
      )}
    </div>
  );
}

export function BrandLink({
  dark = false,
  compact = false,
  href = '/',
  className = '',
}: {
  dark?: boolean;
  compact?: boolean;
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} aria-label="HMS Alert home" className={`inline-flex items-center ${className}`}>
      <BrandMark dark={dark} compact={compact} />
    </Link>
  );
}
