export const separator = (url: string) => {
  return url.includes('?') ? '&' : '?';
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
