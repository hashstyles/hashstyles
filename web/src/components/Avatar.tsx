import React from "react";

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "User").trim();
  const parts = base.split(/\s+/).slice(0, 2);
  return parts.map(p => p.charAt(0).toUpperCase()).join("") || "U";
}

export default function Avatar({
  src,
  name,
  email,
  size = 48,
  className = "",
}: {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}) {
  const [ok, setOk] = React.useState<boolean>(!!src);

  return ok && src ? (
    <img
      src={src}
      alt={name || email || "avatar"}
      width={size}
      height={size}
      className={`rounded-full object-cover border border-[var(--border)] ${className}`}
      onError={() => setOk(false)}
      referrerPolicy="no-referrer"  // avoids some provider blocks
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full grid place-items-center font-semibold text-white ${className}`}
    >
      {/* simple gradient background */}
      <div
        className="w-full h-full rounded-full grid place-items-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(236,72,153,.9), rgba(168,85,247,.9))",
        }}
      >
        <span className="text-sm">{initials(name, email)}</span>
      </div>
    </div>
  );
}
