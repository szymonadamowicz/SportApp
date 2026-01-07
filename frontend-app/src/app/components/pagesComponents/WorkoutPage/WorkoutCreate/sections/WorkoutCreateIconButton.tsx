import clsx from "clsx";

export const IconButton = ({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex h-7 w-7 items-center justify-center rounded-full transition",
      "bg-bgHighlight/50 text-textSecondary hover:bg-bgHighlight",
      danger && "hover:text-red-400"
    )}
  >
    {children}
  </button>
);
