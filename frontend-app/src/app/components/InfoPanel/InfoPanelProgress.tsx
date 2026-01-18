interface InfoPanelProgressProps {
  value: number;
}

export default function InfoPanelProgress({ value }: InfoPanelProgressProps) {
  return (
    <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
      <div
        className="h-full transition-all duration-300"
        style={{
          width: `${Math.min(100, value * 100)}%`,
          background:
            "linear-gradient(90deg, var(--accent), #4ade80, var(--accent-blue))",
          boxShadow: "0 0 18px rgba(34,197,94,0.55)",
        }}
      />
    </div>
  );
}
