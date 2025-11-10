export default function Avatar({ name = 'U', size = 32 }) {
  const initials = name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()
  const style = { width: size, height: size }
  return (
    <div
      className="inline-flex items-center justify-center rounded-full bg-primary text-xs font-semibold uppercase text-white shadow-inner shadow-primary/30"
      style={style}
      aria-label={`Avatar ${name}`}
    >
      {initials}
    </div>
  )
}

