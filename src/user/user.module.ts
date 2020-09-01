import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { SocialProfileEntity } from './SocialProfile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SocialProfileEntity]),
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
