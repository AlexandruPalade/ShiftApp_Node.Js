export type Config = {
  JWT_SECRET: string;
  PORT: number;
  JWT_EXPIRY_TIME: number | string;
  MONGODB: {
    URI: string;
  };
  EMAIL: {
    HOST: string;
    PORT: number;
    USER: string;
    PASSWORD: string;
    FROM_ADDRESS: string;
  };
};
