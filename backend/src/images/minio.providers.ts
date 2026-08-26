import { Client } from 'minio';

export const MinioProvider = {
  provide: 'MINIO',
  useFactory: () =>
    new Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
    }),
};
