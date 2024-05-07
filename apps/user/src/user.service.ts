import { ForbiddenException, Injectable } from '@nestjs/common';
import { SigninDto, SignupDto } from '../dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService){}
  async signup(dto: SignupDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password)
      // save the new user in db
      const user = await this.prisma.user.create({
          data: {
              name: dto.name,
              email: dto.email,
              password: hash
          }
      })
      delete user.password
      //return the saved user
      return user;
    } catch (error) {
      if(error instanceof PrismaClientKnownRequestError){
        if(error.code === 'P2002'){
          throw new ForbiddenException('Email is alredy in use')
        }
      }
      throw error
    }
  }

  async signin(dto: SigninDto) {
    const email = dto.email
        const user = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        })
        // if user does not throw exception
        if(!user) {
            throw new ForbiddenException(`User with this email ${email} does not exist`)
        }
        // compare password
        const isMatch = await argon.verify(
            user.password, 
            dto.password
            );
        if(!isMatch){
            throw new ForbiddenException('Credentials inccorect')
        }
        delete user.password
        // send back the user
        return user
  }

  async signout() {
    return 'signout';
  }
}
