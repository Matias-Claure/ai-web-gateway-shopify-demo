declare module "cors" {
  import { RequestHandler } from "express";

  type CorsOptions = {
    origin?: boolean | string | RegExp | Array<string | RegExp>;
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  };

  function cors(options?: CorsOptions): RequestHandler;

  export default cors;
}
