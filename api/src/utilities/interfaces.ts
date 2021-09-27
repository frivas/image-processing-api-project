import sharp from 'sharp';

export interface IImage {
  filename: string;
  width: number;
  height: number;
  format?: string;
  size?: number;
}

export interface ISharpResult {
  thumbImg: sharp.Metadata;
  imgName: string;
}

export interface IQueryParamsInfo {
  name: string;
  type: string;
  mandatory: boolean;
}

export interface IQueryParams {
  fields: IQueryParamsInfo[];
}

export const defaultImgSize = 200;
export const defaultAssetsDir = 'assets';
export const defaultFullDir = 'full';
export const defaultThumbsDir = 'thumb';
