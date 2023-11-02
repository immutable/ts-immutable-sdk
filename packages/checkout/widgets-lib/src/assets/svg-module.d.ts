/** This module is required for importing svg files into components.
 * Works with the svgr() rollup plugin so that we can do
 * import EthereumPlanet from '../../assets/EthereumPlanet.svg';
*/
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}
