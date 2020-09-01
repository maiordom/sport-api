export class ISignupDto {
  login: string;
  password: string;
}

export class ISignupResponseDto {
  id: string;
}

export class ISigninDto {
  login: string;
  password: string;
}

export class ISigninResponseDto {
  accessToken: string;
}

export class ISocialAuthDto {
  accessToken: string;
}
