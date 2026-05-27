export const inputClass = `
  w-full rounded-xl border border-borderSoft
  bg-bgHighlight/50 px-4 py-3
  text-base text-textPrimary
  outline-none transition
  focus:border-accent focus:bg-bgHighlight/70
  placeholder:text-textSecondary
`;

export const inlineInputClass = `
  w-full rounded-lg border border-borderSoft sm:max-w-[115px]
  bg-bgHighlight/50 px-2 py-1.5
  text-base sm:text-sm text-textPrimary
  outline-none transition
  focus:border-accent
  placeholder:text-textSecondary
`;

export const inlineSymbolClass = `
  flex items-center justify-center
  text-sm text-textSecondary
  select-none
`;

export const inputErrorClass = `
  border-red-400/70
  focus:border-red-400
`;

export const errorHintClass = `
  text-xs text-red-400 mt-1
`;

export const exerciseNameInputClass = `
  w-full rounded-lg
  border border-borderSoft
  bg-bgHighlight/40
  px-3 py-2
  text-sm text-textPrimary
  outline-none transition
  focus:border-accent focus:bg-bgHighlight/60
  placeholder:text-textSecondary
`;
