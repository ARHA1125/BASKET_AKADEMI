import { IsEnum, IsNotEmpty, IsOptional, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../entities/attendance.entity'; 

export class CreateAttendanceDto {
  

  @IsUUID()
  @IsNotEmpty()
  studentId: string;
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;


  @Type(() => Date)
  @IsDate()
  @IsOptional()
  checkInTime?: Date;


  @Type(() => Date)
  @IsDate()
  @IsOptional()
  checkOutTime?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;
}