import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SignupDto, SigninDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService) {
  }

  async signup(dto: SignupDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);
    // save the new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          name: dto.name
        }
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Credentials already in use.");
        }
      }
      throw error;
    }
  }

  async signin(dto: SigninDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });
    if (!user) {
      throw new ForbiddenException("Invalid credentials");
    }
    // compare the password hash
    const pwdMatch = await argon.verify(user.hash, dto.password);
    if (!pwdMatch) {
      throw new ForbiddenException("Invalid credentials");
    }
    // return the user
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email: email
    };
    const secret = this.configService.get("JWT_SECRET");
    const token = this.jwtService.signAsync(payload, {
      expiresIn: "1d",
      secret: secret
    });
    return token.then((t) => {
      return { access_token: t };
    });
  }
}