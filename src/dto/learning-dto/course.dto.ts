import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { CourseStatus, CourseLevel } from '@/entities/learning/learning-course.entity';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;
}

export class UpdateCourseDto extends CreateCourseDto {}

export class CreateChapterDto {
  @IsString()
  title: string;

  @IsNumber()
  order: number;
}

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsBoolean()
  is_preview?: boolean;
}
