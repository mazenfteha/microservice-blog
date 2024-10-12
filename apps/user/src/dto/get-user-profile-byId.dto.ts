import { ApiProperty } from '@nestjs/swagger';

export class FollowInfoDto {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    profileImage: string;
  }

export class GetUserProfileByIdDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  profileImage: string;

  @ApiProperty({
    type: [FollowInfoDto],
  })
  followers: FollowInfoDto[];

  @ApiProperty({
    type: [FollowInfoDto],
  })
  following: FollowInfoDto[];
}


