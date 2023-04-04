interface Window {
    IMTBLConnectWidget: {
        mount: (ConnectParams) => void;
        unmount: () => void;
    };
}

interface ConnectParams {
    elementId: string;
}