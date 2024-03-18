import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SigninDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

}

export class SignupDto extends SigninDto {
  @IsString()
  name: string;
}