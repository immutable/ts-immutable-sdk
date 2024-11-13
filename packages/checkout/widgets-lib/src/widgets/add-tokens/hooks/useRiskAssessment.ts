import { useEffect, useState } from 'react';
import { AssessmentResult, fetchRiskAssessment } from '@imtbl/checkout-sdk';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';

export const useRiskAssessment = () => {
  const [riskAssessment, setRiskAssessment] = useState<AssessmentResult | undefined>();

  const {
    providersState: {
      checkout, fromAddress, toAddress,
    },
  } = useProvidersContext();

  useEffect(() => {
    if (!checkout) {
      return;
    }

    (async () => {
      const addresses: string[] = [];

      if (fromAddress) {
        addresses.push(fromAddress);
      }

      if (toAddress && toAddress !== fromAddress) {
        addresses.push(toAddress);
      }

      if (addresses.length === 0) {
        return;
      }

      const assessment = await fetchRiskAssessment(addresses, checkout.config);
      setRiskAssessment(assessment);
    })();
  }, [checkout, fromAddress, toAddress]);

  return { riskAssessment };
};
