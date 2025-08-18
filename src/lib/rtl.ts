export const logical = (dir: 'ltr' | 'rtl') => ({
  flexRow: dir === 'rtl' ? 'flex-row-reverse' : 'flex-row',
  ml: dir === 'rtl' ? 'mr' : 'ml',
  mr: dir === 'rtl' ? 'ml' : 'mr',
  pl: dir === 'rtl' ? 'pr' : 'pl',
  pr: dir === 'rtl' ? 'pl' : 'pr',
  borderL: dir === 'rtl' ? 'border-r' : 'border-l',
  borderR: dir === 'rtl' ? 'border-l' : 'border-r',
  roundedL: dir === 'rtl' ? 'rounded-r' : 'rounded-l',
  roundedR: dir === 'rtl' ? 'rounded-l' : 'rounded-r',
  textLeft: dir === 'rtl' ? 'text-right' : 'text-left',
  textRight: dir === 'rtl' ? 'text-left' : 'text-right',
});

export function rtlClass(dir: 'ltr' | 'rtl', ltrClass: string, rtlClass: string): string {
  return dir === 'rtl' ? rtlClass : ltrClass;
}