import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      const mongo = await MongoMemoryServer.create();
      const uri = mongo.getUri();
      return {
        uri,
        ...options,
      };
    },
  });

export const closeMongodConnection = async () => {
  if (mongod) await mongod.stop();
};
