import express, { Request, Response } from 'express';
import logger from './middleware/logger';
import isUndefined from 'lodash.isundefined';
import validateReqQuery from './middleware/validateReqQuery';
import { ImageProcessor } from './utilities/imageProcessor';
import {
  IImage,
  defaultImgSize,
  defaultAssetsDir,
  defaultThumbsDir,
  ISharpResult
} from './utilities/interfaces';
import path from 'path';

class App {
  public express: express.Application;
  protected defaultThumbPath: string;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.defaultThumbPath = path.join(defaultAssetsDir, defaultThumbsDir);
  }

  private middleware(): void {
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(logger);
    this.express.use(
      express.static(
        path.join(process.cwd(), defaultAssetsDir, defaultThumbsDir),
        { maxAge: '1h' }
      )
    );
    this.express.set('view engine', 'pug');
    this.express.set('views', path.join(__dirname, 'views'));
  }

  private async routes(): Promise<void> {
    this.express.get('/', (req: Request, res: Response) => {
      res.send('Server is Up!');
    });

    this.express.get(
      '/api/images',
      validateReqQuery(['filename']),
      async (req: Request, res: Response) => {
        console.log(
          path.join(process.cwd(), defaultAssetsDir, defaultThumbsDir)
        );
        const imageInfo: IImage = {
          filename: '',
          width: 0,
          height: 0
        };
        console.log(`Views => ${path.join(__dirname, 'views')}`);
        imageInfo.filename = <string>(<unknown> req.query.filename);
        imageInfo.width = <number>(<unknown> req.query.width) || defaultImgSize;
        imageInfo.height =
          <number>(<unknown> req.query.height) || defaultImgSize;
        const imgProc = new ImageProcessor(imageInfo);
        const thumbImg: ISharpResult | undefined = await imgProc.resizeImg();
        if (isUndefined(thumbImg)) {
          res
            .status(400)
            .send(
              `The file ${imageInfo.filename} doesn't exist. Please, add it to the full directory and try again.`
            );
        } else {
          // res.send(`${JSON.stringify(thumbImg, null, 2)}`);
          res.render('index', {
            imgInfo: thumbImg.thumbImg,
            imgName: `/${thumbImg.imgName}`
          });
        }
      }
    );
  }
}

export default new App().express;
