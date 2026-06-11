interface ExtraBadgeProps {
  name: string;
}

export default function ExtraBadge({ name }: ExtraBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
      ✨ {name} Ekledi
    </span>
  );
}
