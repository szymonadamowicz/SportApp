export const InfoPanelAnchor = ({ link, label }: { link: string; label: string }) => {
  return (
    <a
      href={link}
      className="text-sm text-accent hover:underline hover:opacity-90 cursor-pointer select-none"
    >
      {label}
    </a>
  )
};