export type PopUpProps = {
  url: string;
  title: string;
  width: number;
  height: number;
  query?: string;
};

export const openPopupCenter = ({
  url,
  title,
  width,
  height,
}: PopUpProps): Window => {
  const left = Math.max(
    0,
    Math.round(window.screenX + (window.outerWidth - width) / 2)
  );
  const top = Math.max(
    0,
    Math.round(window.screenY + (window.outerHeight - height) / 2)
  );
  const newWindow = window.open(
    url,
    title,
    `
      scrollbars=yes,
      width=${width}, 
      height=${height}, 
      top=${top}, 
      left=${left}
     `
  );
  if (!newWindow) {
    throw new Error('Failed to open confirmation screen');
  }

  newWindow.focus();
  return newWindow;
};
