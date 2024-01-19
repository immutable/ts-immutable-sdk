import { IParseOptions, IStringifyOptions } from 'qs';

export const STRINGIFY_SETTINGS: IStringifyOptions = {
  addQueryPrefix: true,
  encode: false,
};

export const PARSE_SETTINGS: IParseOptions = {
  ignoreQueryPrefix: true,
};
