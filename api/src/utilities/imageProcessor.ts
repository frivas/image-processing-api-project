import fs from 'fs';
import path from 'path';
import {
  IImage,
  defaultAssetsDir,
  defaultFullDir,
  defaultThumbsDir,
  ISharpResult
} from './Interfaces';
import isEqual from 'lodash.isequal';
import sharp from 'sharp';

export class ImageProcessor {
  imageInfo: IImage;
  defaultFullPath: string;
  defaultThumbPath: string;

  constructor(imageInfo: IImage) {
    this.imageInfo = imageInfo;
    this.defaultFullPath = path.join(
      __dirname,
      `../../${defaultAssetsDir}`,
      defaultFullDir
    );
    this.defaultThumbPath = path.join(
      __dirname,
      `../../${defaultAssetsDir}`,
      defaultThumbsDir
    );
  }

  async resizeImg(): Promise<ISharpResult | undefined> {
    try {
      const fullFileList = await this.listFilesInDirectory(
        this.defaultFullPath
      );
      const thumbFileList = await this.listFilesInDirectory(
        this.defaultThumbPath
      );

      const imgFullFilename = fullFileList.filter((el) => {
        return isEqual(el.split('.')[0], this.imageInfo.filename);
      });
      const imgThumbFilename = thumbFileList.filter((el) => {
        return isEqual(
          el.split('.')[0],
          `${this.imageInfo.filename}_${this.imageInfo.width}w_${this.imageInfo.height}h_thumb`
        );
      });

      if (isEqual(imgFullFilename.length, 0)) {
        return undefined;
      }
      const pathToFullFile = path.join(
        this.defaultFullPath,
        imgFullFilename[0]
      );

      const pathToThumbFile = path.join(
        this.defaultThumbPath,
        `${imgFullFilename[0].split('.')[0]}_${this.imageInfo.width}w_${this.imageInfo.height
        }h_thumb.${imgFullFilename[0].split('.')[1]}`
      );

      if (imgThumbFilename.length > 0) {
        const thumbImg: sharp.Metadata = await sharp(
          pathToThumbFile
        ).metadata();
        return {
          thumbImg,
          imgName: imgThumbFilename[0]
        };
      } else {
        const resultImage: sharp.OutputInfo = await sharp(pathToFullFile)
          .resize(Number(this.imageInfo.width), Number(this.imageInfo.height))
          .toFile(pathToThumbFile);
        const thumbImg: sharp.Metadata = await sharp(
          pathToThumbFile
        ).metadata();

        if (resultImage) {
          return {
            thumbImg,
            imgName: `${imgFullFilename[0].split('.')[0]}_${this.imageInfo.width
              }w_${this.imageInfo.height}h_thumb.${imgFullFilename[0].split('.')[1]
              }`
          };
        }
      }
    } catch (Error) {
      console.log(Error);
    }
  }

  async listFilesInDirectory(path: string): Promise<string[]> {
    return new Promise((resolve, reject) =>
      fs.readdir(path, (err, content) => (err ? reject(err) : resolve(content)))
    );
  }
}

export async function getImageMetada(
  pathToImage: string
): Promise<sharp.Metadata> {
  const imageInfo: sharp.Metadata = await sharp(pathToImage).metadata();
  return imageInfo;
}
