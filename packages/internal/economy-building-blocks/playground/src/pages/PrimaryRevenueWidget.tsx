import { useEffect, useRef } from "react";
import { IMTBLWidgetEvents } from "@imtbl/checkout-widgets";

const useParams = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const amount = urlParams.get("amount") as string;
  const env = urlParams.get("env") as string;
  const theme = urlParams.get("theme") as string;
  const environmentId = urlParams.get("environmentId") as string;
  const fromContractAddress = urlParams.get("fromContractAddress") as string;
  const products = urlParams.get("products") as string;

  return {
    env,
    theme,
    environmentId,
    fromContractAddress,
    products,
    amount,
  };
};

const handleEvent = ((event: CustomEvent) => {
  const detail = event.detail;
  const provider = detail?.data?.provider;

  if (provider) {
    (async () => {
      const signer = provider?.getSigner();
      const walletAddress = (await signer?.getAddress()) || "";
      window?.opener?.postMessage(
        {
          type: "mint_sale_popup_event",
          identifier: "primary-revenue-widget-events",
          data: {
            type: [event.type, detail.type].filter(Boolean).join("-"),
            walletProvider: detail.data.walletProvider,
            walletAddress,
          },
        },
        "*"
      );
    })();
    return;
  }

  window?.opener?.postMessage(
    {
      type: "mint_sale_popup_event",
      identifier: "primary-revenue-widget-events",
      data: event.detail,
    },
    "*"
  );
}) as EventListener;

function PrimaryRevenueWidget() {
  const { amount, products, theme, env, environmentId, fromContractAddress } =
    useParams();

  console.log("@@@@@ products", JSON.parse(atob(products)));
  const componentRef = useRef(null);

  useEffect(() => {
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
      handleEvent
    );
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
      handleEvent
    );

    // Assuming window.sharedData.passportInstance contains the necessary data
    const passportInstance = window?.opener?.sharedData?.passportInstance;

    console.log("@@@@@ passportInstance", passportInstance);

    if (passportInstance && componentRef.current) {
      (
        componentRef.current as unknown as ImmutableWebComponent
      ).addPassportOption(passportInstance);
    }

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
        handleEvent
      );
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
        handleEvent
      );
    };
  }, []);

  return (
    <imtbl-primary-revenue
      ref={componentRef}
      widgetConfig={JSON.stringify({
        theme,
        environment: env,
      })}
      amount={amount}
      products={products}
      fromContractAddress={fromContractAddress}
      environmentId={environmentId}
      env={env}
    />
  );
}

export default PrimaryRevenueWidget;
