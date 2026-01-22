import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketplaceModuleDto } from './create-marketplace-module.dto';

export class UpdateMarketplaceModuleDto extends PartialType(CreateMarketplaceModuleDto) {}
