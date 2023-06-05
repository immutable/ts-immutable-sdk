export const separator = (url: string) => (url.includes('?') ? '&' : '?');

export const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
