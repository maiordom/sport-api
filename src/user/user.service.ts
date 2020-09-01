import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import {
  Injectable,
  HttpException,
  HttpStatus,
  HttpService,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import {
  ISigninDto,
  ISigninResponseDto,
  ISignupDto,
  ISignupResponseDto,
  ISocialAuthDto,
} from './user.dto';
export { ISigninDto, ISignupDto, ISocialAuthDto } from './user.dto';

import { UserEntity } from './user.entity';
import { SocialProfileEntity } from './socialProfile.entity';

import config from '../config.json';

export class ISocialProfile {
  id: string;
  email: string;
  name: string;
  provider?: string;
}

export class IFacebookUser extends ISocialProfile {}
export class IGoogleUser extends ISocialProfile {}

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  getAccessToken(id: string): string {
    return jwt.sign(
      {
        id,
      },
      config.salt,
      { expiresIn: '7d' },
    );
  }

  async signin({ login, password }: ISigninDto): Promise<ISigninResponseDto> {
    const user = await this.userRepository.findOne({ where: { login } });

    if (!user || !user.checkPassword(password)) {
      throw new HttpException(
        { error: 'INVALID_CREDENTIALS' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      accessToken: this.getAccessToken(user.id),
    };
  }

  async getUserBySocialProfile(socialId: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.socials', 'social')
      .where('social.socialId = :socialId', { socialId })
      .getOne();

    return user;
  }

  async getFacebookProfile(params: ISocialAuthDto) {
    let socialProfile;

    try {
      const { data } = await this.httpService
        .get<IFacebookUser>('https://graph.facebook.com/v6.0/me', {
          params: {
            fields: 'id,name,email',
            access_token: params.accessToken,
          },
        })
        .toPromise();

      socialProfile = data;
      socialProfile.provider = 'facebook';
    } catch (_) {
      throw new HttpException(
        { error: 'INVALID_TOKEN' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return socialProfile;
  }

  async getGoogleProfile(params: ISocialAuthDto) {
    let socialProfile;

    try {
      const { data } = await this.httpService
        .get<IGoogleUser>('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
          },
        })
        .toPromise();

      socialProfile = data;
      socialProfile.provider = 'google';
    } catch (_) {
      throw new HttpException(
        { error: 'INVALID_TOKEN' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return socialProfile;
  }

  async connectGoogle(params: ISocialAuthDto) {
    const socialProfile = await this.getGoogleProfile(params);
    let user;

    if (socialProfile) {
      user = await this.getUserBySocialProfile(socialProfile.id);
    }

    if (!user) {
      user = await this.createUserBySocialProfile(socialProfile);

      return {
        accessToken: this.getAccessToken(user.id),
      };
    }

    return {
      accessToken: this.getAccessToken(user.id),
    };
  }

  async connectFacebook(params: ISocialAuthDto) {
    const socialProfile = await this.getFacebookProfile(params);
    let user;

    if (socialProfile) {
      user = await this.getUserBySocialProfile(socialProfile.id);
    }

    if (!user) {
      user = await this.createUserBySocialProfile(socialProfile);

      return {
        accessToken: this.getAccessToken(user.id),
      };
    }

    return {
      accessToken: this.getAccessToken(user.id),
    };
  }

  async signup({ login, password }: ISignupDto): Promise<ISignupResponseDto> {
    const user = await this.userRepository.findOne({
      where: { login },
    });

    if (user) {
      throw new HttpException(
        { error: 'USER_ALREADY_EXISTS' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userEntity = await this.userRepository.create({ login, password });
    const { id } = await this.userRepository.save(userEntity);

    return {
      id,
    };
  }

  async createUserBySocialProfile(socialProfile: ISocialProfile) {
    const userEntity = new UserEntity();
    const socialProfileEntity = new SocialProfileEntity();

    socialProfileEntity.socialId = socialProfile.id;
    socialProfileEntity.socialName = socialProfile.provider;

    userEntity.socials = [socialProfileEntity];
    userEntity.name = socialProfile.name;
    userEntity.email = socialProfile.email;

    return await this.userRepository.save(userEntity);
  }
}
