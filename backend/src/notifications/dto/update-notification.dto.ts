import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationDto {
  @ApiProperty({ description: 'Mark notification as read' })
  @IsBoolean()
  isRead: boolean;
} 