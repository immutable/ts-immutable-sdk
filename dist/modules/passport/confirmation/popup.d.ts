export type PopUpProps = {
    url: string;
    title: string;
    width: number;
    height: number;
    query?: string;
};
export declare const openPopupCenter: ({ url, title, width, height }: PopUpProps) => Window;
