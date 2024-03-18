import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SignupDto, SigninDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {

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
      delete user.hash;
      return user;
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
    delete user.hash;
    return user;
  }

}