import Link from "next/link";

export const InfoPanelAnchor = ({
  link,
  label,
}: {
  link: string;
  label: string;
}) => {
  return (
    <Link
      href={link}
      className="text-sm text-accent hover:underline hover:opacity-90 cursor-pointer select-none"
    >
      {label}
    </Link>
  );
};
