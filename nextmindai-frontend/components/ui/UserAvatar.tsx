"use client";

interface Props {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-[12px]",
  md: "w-10 h-10 text-[12px]",
  lg: "w-16 h-16 text-[20px]",
};

export default function UserAvatar({ name, avatarUrl, size = "sm", className = "" }: Props) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${sizes[size]} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
