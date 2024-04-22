export type IframePositionKeys = 'left' | 'right' | 'top' | 'bottom';

export type IframePositionOptions = {
  [key in IframePositionKeys]?: string;
};

export type IframeSizeOptions = {
  width: number;
  height: number;
};

export type FullIframeOptions = {
  size: IframeSizeOptions;
  position: IframePositionOptions;
  className: string;
  containerElement: HTMLElement;
  protectAgainstGlobalStyleBleed: boolean;
  hidden?: boolean;
};

export type ConfigurableIframeOptions = null | {
  position?: IframePositionOptions;
  className?: string;
  containerElement?: HTMLElement;
  protectAgainstGlobalStyleBleed?: boolean;
};
