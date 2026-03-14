import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;
}
