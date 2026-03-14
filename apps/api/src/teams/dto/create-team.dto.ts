import { IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @MaxLength(150)
  name!: string;
}
