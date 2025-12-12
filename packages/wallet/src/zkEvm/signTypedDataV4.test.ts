import { JsonRpcError, RpcErrorCode } from './JsonRpcError';

const { transformTypedData } = require('./signTypedDataV4');

describe('transformTypedData', () => {
  const validTypedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
    },
    domain: {
      name: 'Test',
      version: '1',
      chainId: 13473,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    primaryType: 'Person',
    message: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
  };

  describe('chainId normalization', () => {
    it('should normalize chainId from number to number', () => {
      const typedData = {
        ...validTypedData,
        domain: { ...validTypedData.domain, chainId: 13473 },
      };

      const result = transformTypedData(typedData, BigInt(13473));

      expect(result.domain.chainId).toBe(13473);
      expect(typeof result.domain.chainId).toBe('number');
    });

    it('should normalize chainId from string to number', () => {
      const typedData = {
        ...validTypedData,
        domain: { ...validTypedData.domain, chainId: '13473' },
      };

      const result = transformTypedData(typedData, BigInt(13473));

      expect(result.domain.chainId).toBe(13473);
      expect(typeof result.domain.chainId).toBe('number');
    });

    it('should normalize chainId from hex string to number', () => {
      const typedData = {
        ...validTypedData,
        domain: { ...validTypedData.domain, chainId: '0x34a1' }, // 13473 in hex
      };

      const result = transformTypedData(typedData, BigInt(13473));

      expect(result.domain.chainId).toBe(13473);
      expect(typeof result.domain.chainId).toBe('number');
    });

    it('should throw error when chainId does not match expected', () => {
      const typedData = {
        ...validTypedData,
        domain: { ...validTypedData.domain, chainId: 1 },
      };

      expect(() => transformTypedData(typedData, BigInt(13473))).toThrow(
        new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'Invalid chainId, expected 13473'),
      );
    });

    it('should allow missing chainId in domain', () => {
      const typedData = {
        ...validTypedData,
        domain: {
          name: 'Test',
          version: '1',
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
      };

      const result = transformTypedData(typedData, BigInt(13473));

      expect(result.domain.chainId).toBeUndefined();
    });
  });

  describe('JSON string parsing', () => {
    it('should parse valid JSON string typed data', () => {
      const result = transformTypedData(JSON.stringify(validTypedData), BigInt(13473));

      expect(result.primaryType).toBe('Person');
      expect(result.domain.chainId).toBe(13473);
    });

    it('should throw error for invalid JSON string', () => {
      expect(() => transformTypedData('invalid json', BigInt(13473))).toThrow(JsonRpcError);
    });
  });

  describe('validation', () => {
    it('should throw error when required properties are missing', () => {
      const invalidTypedData = {
        types: {},
        domain: {},
        // missing primaryType and message
      };

      expect(() => transformTypedData(invalidTypedData, BigInt(13473))).toThrow(
        new JsonRpcError(
          RpcErrorCode.INVALID_PARAMS,
          'Invalid typed data argument. The following properties are required: types, domain, primaryType, message',
        ),
      );
    });
  });
});
