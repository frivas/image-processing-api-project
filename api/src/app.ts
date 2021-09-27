import express from 'express';
import cors from 'cors';
import logger from './middleware/logger';
import {
  defaultAssetsDir,
  defaultThumbsDir,
  defaultFullDir
} from './utilities/Interfaces';
import path from 'path';
import { router } from './routes/routes';

class App {
  public express: express.Application;
  protected defaultThumbPath: string;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes([router]);
    this.defaultThumbPath = path.join(defaultAssetsDir, defaultThumbsDir);
  }

  private middleware(): void {
    this.express.use(express.json());
    this.express.use(cors());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(logger);
    this.express.use(
      '/full',
      express.static(
        path.join(__dirname, `../${defaultAssetsDir}/${defaultFullDir}`),
        {
          maxAge: '1h'
        }
      )
    );
    this.express.use(
      '/thumb',
      express.static(
        path.join(__dirname, `../${defaultAssetsDir}/${defaultThumbsDir}`),
        {
          maxAge: '1h'
        }
      )
    );
  }

  private routes(routes: Array<express.Router>) {
    routes.forEach((route) => {
      this.express.use(route);
    });
  }
}

export default new App().express;
