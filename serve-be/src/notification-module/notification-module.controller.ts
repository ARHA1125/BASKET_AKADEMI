import { Controller } from '@nestjs/common';
import { NotificationModuleService } from './notification-module.service';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';

@Roles(UserRole.ADMIN)
@Controller('notification-module')
export class NotificationModuleController {
  constructor(private readonly notificationModuleService: NotificationModuleService) {}
}
