import { Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {

  }

  login() {
    return "This action logs a user in";
  }

  signup() {
    return "This action signs a user up";
  }
}