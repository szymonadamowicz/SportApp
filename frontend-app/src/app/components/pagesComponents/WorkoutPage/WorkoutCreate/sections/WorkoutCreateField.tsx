export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="space-y-0.5">
      <label className="text-sm font-medium text-textSecondary">
        {label}
      </label>
      {hint && <p className="text-xs text-textMuted">{hint}</p>}
    </div>
    {children}
  </div>
);