import { strict as assert } from 'assert';
import { v4 as uuidv4 } from 'uuid';
import { SharedState } from './shared-state';
import { repeatCheck } from '../lib/utils';

export class MetadataRefresh {
  private metadataId = '';
  private newNftName = '';
  constructor(protected sharedState: SharedState) { }

  // @then('sdk should refresh collection metadata', undefined, DEFAULT_TIMEOUT)
  public async refreshCollectionMetadata() {
    const { chainName } = this.sharedState;
    const newName = uuidv4();

    await repeatCheck(60)(async () => {
      const refresh = await this.sharedState.blockchainData.refreshCollectionMetadata(
        {
          chainName: chainName,
          contractAddress: "0x9681b8edd3ea89b04af102b14d43c767af7c425d",
          refreshCollectionMetadataRequest: {
            collection_metadata: {
              name: newName,
              symbol: "Sword",
              description: "2022-08-16T17:43:26.991388Z",
              base_uri: "https://some-url",
              external_link: "https://some-url",
              contract_uri: "https://some-url",
              image: "https://some-url",
            },
          },
        },
      );
      assert.equal(refresh.collection_metadata.name, newName);
    });
  }

  // @then('sdk should queue a refresh for multiple token metadata', undefined, DEFAULT_TIMEOUT)
  public async refreshTokenMetadata() {
    const { chainName } = this.sharedState;
    this.newNftName = uuidv4();

    await repeatCheck(60)(async () => {
      const refresh = await this.sharedState.blockchainData.refreshNFTMetadata(
        {
          chainName: chainName,
          contractAddress: "0x9681b8edd3ea89b04af102b14d43c767af7c425d",
          refreshNFTMetadataByTokenIDRequest: {
            nft_metadata: [{
              token_id: "1",
              name: this.newNftName,
              description: "2022-08-16T17:43:26.991388Z",
              image: "https://www.commerce.coinbase.com",
              animation_url: "https://some-url",
              youtube_url: "https://www.commerce.coinbase.com",
              external_url: "https://www.google.ca",
              attributes: [
                {
                  trait_type: "Aqua Power",
                  value: "Happy"
                }
              ]
            }]
          },
        },
      );
      assert.notEqual(refresh.imx_remaining_refreshes, null);
    });
  }

  // @then('sdk should fetch refreshed token with a refreshed result', undefined, DEFAULT_TIMEOUT)
  public async getToken() {
    await repeatCheck(60)(async () => {
      const { chainName } = this.sharedState;
      const getNFT = this.sharedState.blockchainData.getNFT;
      const nft: Awaited<ReturnType<typeof getNFT>> =
        await this.sharedState.blockchainData.getNFT({
          chainName: chainName,
          contractAddress: "0x9681b8edd3ea89b04af102b14d43c767af7c425d",
          tokenId: "1",
        });
      assert.equal(nft.result.name, this.newNftName);
      this.metadataId = nft.result.metadata_id || '';
    });
  }

  // @then('sdk should queue a refresh for multiple token metadata', undefined, DEFAULT_TIMEOUT)
  public async refreshMetadataById() {
    const { chainName } = this.sharedState;
    this.newNftName = uuidv4();

    await repeatCheck(60)(async () => {
      const refresh = await this.sharedState.blockchainData.refreshStackedMetadata(
        {
          chainName: chainName,
          contractAddress: "0x9681b8edd3ea89b04af102b14d43c767af7c425d",
          refreshMetadataByIDRequest: {
            metadata: [{
              metadata_id: this.metadataId,
              name: this.newNftName,
              description: "2022-08-16T17:43:26.991388Z",
              image: "https://www.commerce.coinbase.com",
              animation_url: "https://some-url",
              youtube_url: "https://www.commerce.coinbase.com",
              external_url: "https://www.google.ca",
              attributes: [
                {
                  trait_type: "Aqua Power",
                  value: "Happy"
                }
              ]
            }]
          },
        },
      );
      assert.notEqual(refresh.imx_remaining_refreshes, null);
    });
  }
}

