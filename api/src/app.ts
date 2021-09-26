import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import promises from 'fs/promises';
import logger from './middleware/logger';
import isUndefined from 'lodash.isundefined';
import validateReqQuery from './middleware/validateReqQuery';
import { getImageMetada, ImageProcessor } from './utilities/ImageProcessor';
import {
  IImage,
  defaultImgSize,
  defaultAssetsDir,
  defaultThumbsDir,
  defaultFullDir,
  ISharpResult
} from './utilities/Interfaces';
import path from 'path';
import multer from 'multer';
import imageFilter from './utilities/ImageFilter';
import isEqual from 'lodash.isequal';

class App {
  public express: express.Application;
  protected defaultThumbPath: string;
  protected defaultFullPath: string;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.defaultThumbPath = path.join(defaultAssetsDir, defaultThumbsDir);
    this.defaultFullPath = path.join(defaultAssetsDir, defaultFullDir);
  }

  private middleware(): void {
    this.express.use(express.json());
    this.express.use(cors());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(logger);
    this.express.use(
      '/full',
      express.static(
        path.join(__dirname, `/../${defaultAssetsDir}/${defaultFullDir}`),
        {
          maxAge: '1h'
        }
      )
    );
    this.express.use(
      '/thumb',
      express.static(
        path.join(__dirname, `/../${defaultAssetsDir}/${defaultThumbsDir}`),
        {
          maxAge: '1h'
        }
      )
    );
  }

  private async routes(): Promise<void> {
    const storage = multer.diskStorage({
      destination: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
      ) => {
        cb(null, this.defaultFullPath);
      },
      filename: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
      ) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName);
      }
    });

    this.express.get('/', (_: Request, res: Response) => {
      res.send({ message: 'Server is Up!' });
    });

    this.express.get(
      '/api/images',
      validateReqQuery(['filename']),
      async (req: Request, res: Response) => {
        const imageInfo: IImage = {
          filename: '',
          width: 0,
          height: 0
        };

        imageInfo.filename = <string>(<unknown>req.query.filename);
        imageInfo.width = <number>(<unknown>req.query.width) || defaultImgSize;
        imageInfo.height =
          <number>(<unknown>req.query.height) || defaultImgSize;
        const imgProc = new ImageProcessor(imageInfo);
        const thumbImg: ISharpResult | undefined = await imgProc.resizeImg();
        if (isUndefined(thumbImg)) {
          res.status(400).send({
            message: `The file ${imageInfo.filename} doesn't exist. Please, add it to the full directory and try again.`
          });
        } else {
          res.sendFile(
            `${path.join(
              __dirname,
              `/../${defaultAssetsDir}/${defaultThumbsDir}`
            )}/${thumbImg.imgName}`
          );
        }
      }
    );

    this.express.get(
      '/api/images/list',
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          let imgInfo: IImage;
          const pathToThumbImages = path.join(
            __dirname,
            `/../${defaultAssetsDir}/${defaultThumbsDir}`
          );
          const filesList: IImage[] = [];
          const imagesListFromDir = await promises.readdir(pathToThumbImages);
          const imageList = imagesListFromDir.filter(
            (item) => !/(^|\/)\.[^/.]/g.test(item)
          );
          if (isEqual(imageList.length, 0)) {
            res.send({ message: 'There are not thumbnails created yet.' });
            return next();
          }

          for (const image of imageList) {
            const matadataInfo = await getImageMetada(
              `${pathToThumbImages}/${image}`
            );
            imgInfo = {
              filename: `${req.protocol}://${req.get('host')}/thumb/${image}`,
              width: matadataInfo.width || 0,
              height: matadataInfo.height || 0,
              size: matadataInfo.size,
              format: matadataInfo.format
            };
            filesList.push(imgInfo);
          }
          res.send(filesList);
        } catch (e) {
          console.log(e);
        }
      }
    );

    this.express.post(
      '/api/images/upload',
      async (req: Request, res: Response) => {
        const upload = multer({
          storage: storage,
          fileFilter: imageFilter
        }).array('files', 10);
        upload(req, res, (err) => {
          if (err as Error) {
            res.status(400).send({ message: (err as Error).message });
          } else if (!req.files || isEqual(req.files.length, 0)) {
            res
              .status(400)
              .send({ message: 'Please add at least one image to upload' });
          } else if (err instanceof multer.MulterError) {
            res.status(400).send({ message: err.message });
          } else {
            const result = (req.files as Express.Multer.File[]).map((item) => {
              return item.originalname;
            });
            res.send({
              message: result
            });
          }
        });
      }
    );
  }
}

export default new App().express;
