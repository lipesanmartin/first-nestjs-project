import { Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";
@Injectable({})
export class AuthService {
  login() {
    return "This action logs a user in";
  }

  signup() {
    return "This action signs a user up";
  }
}