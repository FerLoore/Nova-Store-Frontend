export function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
  onClick,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  // font + tracking: 12px/500/uppercase/tracking 0.04em
  const labelStyle = "text-[12px] font-medium uppercase tracking-[0.04em]";

  let variant_cls = "";

  if (variant === "primary") {
    // volt fill, ink text, hover volt-hover
    variant_cls =
      `${labelStyle} bg-volt text-ink px-4 py-2 rounded-[6px] hover:bg-volt-hover`;
  } else if (variant === "ghost") {
    // Botón primario legacy alias → primary
    variant_cls =
      `${labelStyle} bg-volt text-ink px-4 py-2 rounded-[6px] hover:bg-volt-hover`;
  } else if (variant === "secondary") {
    // transparent, ink border
    variant_cls =
      `${labelStyle} bg-transparent border border-ink text-ink px-4 py-2 rounded-[6px] hover:bg-bone`;
  } else if (variant === "compact") {
    // small action button — volt fill
    variant_cls =
      `${labelStyle} bg-volt text-ink px-[10px] py-[4px] rounded-[6px] hover:bg-volt-hover`;
  } else if (variant === "compact-ghost") {
    // small secondary action — ink border
    variant_cls =
      `${labelStyle} bg-transparent border border-ink text-ink px-[10px] py-[4px] rounded-[6px] hover:bg-bone`;
  } else if (variant === "destructive") {
    // obsidian fill, white text — for confirmation actions
    variant_cls =
      `${labelStyle} bg-obsidian text-white px-4 py-2 rounded-[6px] hover:bg-[#2a2929]`;
  } else if (variant === "subtle") {
    variant_cls =
      `${labelStyle} bg-bone text-ink px-4 py-2 rounded-[6px] hover:bg-hairline`;
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variant_cls} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

