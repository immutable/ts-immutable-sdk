export const metadata = {
  name: `random name ${Math.random()}`,
  description: 'This NFT is a Brown Dog in a Green Car',
  image:
    'https://mt-test-2.s3.ap-southeast-2.amazonaws.com/BDGC.png',
  external_url: null,
  animation_url: null,
  youtube_url: null,
  attributes: [
    {
      trait_type: 'Pet',
      value: 'Dog',
    },
    {
      trait_type: 'Pet Colour',
      value: 'Brown',
    },
    {
      trait_type: 'Vehicle',
      value: 'Car',
    },
    {
      trait_type: 'Vehicle Colour',
      value: 'Green',
    },
  ],
}