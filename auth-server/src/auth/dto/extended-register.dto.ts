import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class ExtendedRegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100, { message: 'Password is too long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/, {
    message: 'Password must contain letters, numbers, and special characters',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name is too long' })
  name: string;

  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'Birthdate must be 6 digits (YYMMDD)' })
  birthdate: string;

  @IsOptional()
  @IsString()
  firebaseIdToken?: string;
}
