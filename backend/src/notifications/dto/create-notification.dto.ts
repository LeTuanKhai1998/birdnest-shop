import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  ORDER = 'ORDER',
  STOCK = 'STOCK',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM',
  PROMOTION = 'PROMOTION',
}

export enum RecipientType {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body (optional)' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ 
    description: 'Notification type',
    enum: NotificationType 
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ 
    description: 'Recipient type',
    enum: RecipientType 
  })
  @IsEnum(RecipientType)
  recipientType: RecipientType;

  @ApiProperty({ description: 'User ID (optional for broadcast notifications)' })
  @IsOptional()
  @IsString()
  userId?: string;
} 