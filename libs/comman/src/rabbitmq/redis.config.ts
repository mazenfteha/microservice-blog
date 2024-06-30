import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";

export default async (configService: ConfigService) => {
    const ENV = configService.get('NODE_ENV');
    const config = {
      isGlobal: true,
      ttl: 6 * 10000,
      store: redisStore,
      url : 'redis://localhost:6379'
    };

    if (ENV == 'production') {
      config.url = 'redis://redis:6379';
    }
    
    return config;
  }