import { Controller, Post, Body } from '@nestjs/common';

import {
  UserService,
  ISignupDto,
  ISigninDto,
  ISocialAuthDto,
} from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Post('api/v1/auth/connect/facebook')
  connectFacebook(@Body() params: ISocialAuthDto) {
    return this.userService.connectFacebook(params);
  }

  @Post('api/v1/auth/connect/google')
  connectGoogle(@Body() params: ISocialAuthDto) {
    return this.userService.connectGoogle(params);
  }

  @Post('api/v1/auth/signup')
  signup(@Body() params: ISignupDto) {
    return this.userService.signup(params);
  }

  @Post('api/v1/auth/signin')
  signin(@Body() params: ISigninDto) {
    return this.userService.signin(params);
  }
}
