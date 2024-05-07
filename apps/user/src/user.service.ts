import { ForbiddenException, Injectable } from '@nestjs/common';
import { SigninDto, SignupDto } from '../dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
    ){}
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
        return this.signToken(user.id, user.email)
  }

  async signout() {
    return 'signout';
  }

  async signToken(userId: number, email: string) : Promise<{access_token : string}>{
    const payload = {
        userId: userId,
        email: email
    }

    const secret = this.config.get('JWT_SECRET')
    const token = await this.jwt.signAsync(payload, {
        secret: secret,
        expiresIn: '30m'
    })

    return {
        access_token : token
    }
  }
}


