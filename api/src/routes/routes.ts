import express, { NextFunction, Request, Response } from 'express';
import promises from 'fs/promises';
import isUndefined from 'lodash.isundefined';
import { getImageMetada, ImageProcessor } from '../utilities/ImageProcessor';
import {
  IImage,
  defaultImgSize,
  defaultAssetsDir,
  defaultThumbsDir,
  defaultFullDir,
  ISharpResult
} from '../utilities/Interfaces';
import path from 'path';
import multer from 'multer';
import imageFilter from '../utilities/ImageFilter';
import isEqual from 'lodash.isequal';
import { check, validationResult } from 'express-validator';

export const router = express.Router();

const defaultFullPath = path.join(defaultAssetsDir, defaultFullDir);

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, defaultFullPath);
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

router.get('/', (_: Request, res: Response) => {
  res.send({ message: 'Server is Up!' });
});

router.get(
  '/api/images',
  [
    check('filename', 'Filename is required.').notEmpty(),
    check('width', 'This must be a valid number')
      .optional()
      .toInt()
      .isNumeric(),
    check('height', 'This must be a valid number.')
      .optional()
      .toInt()
      .isNumeric()
  ],
  async (req: Request, res: Response) => {
    const imageInfo: IImage = {
      filename: '',
      width: 0,
      height: 0
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array({ onlyFirstError: true })[0].msg });
    }
    imageInfo.filename = <string>(<unknown>req.query.filename);
    imageInfo.width = <number>(<unknown>req.query.width) || defaultImgSize;
    imageInfo.height = <number>(<unknown>req.query.height) || defaultImgSize;
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
          `/../../${defaultAssetsDir}/${defaultThumbsDir}`
        )}/${thumbImg.imgName}`
      );
    }
  }
);

router.get(
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

router.post('/api/images/upload', async (req: Request, res: Response) => {
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
});
