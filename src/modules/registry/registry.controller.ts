import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RegistryService } from './registry.service';
import {
  CreateModuleDto,
  CreateRegistryDto,
  UpdateRegistryDto,
} from '@/dto/registry.dto';

@Controller('registry')
@UseGuards(JwtAuthGuard)
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  // ─── Modules ─────────────────────────────────────────────────────────────

  @Get('modules')
  async listModules() {
    const modules = await this.registryService.findAllModules();
    return { success: true, modules };
  }

  @Post('modules')
  async createModule(@Body() dto: CreateModuleDto) {
    const module = await this.registryService.createModule(dto);
    return { success: true, module };
  }

  // ─── Registries ──────────────────────────────────────────────────────────

  @Get()
  async listRegistries(
    @Query('app_key') appKey?: string,
    @Query('tenant_key') tenantKey?: string,
  ) {
    const registries = await this.registryService.findAllRegistries(appKey, tenantKey);
    return { success: true, registries };
  }

  @Post()
  async createRegistry(@Body() dto: CreateRegistryDto) {
    const registry = await this.registryService.createRegistry(dto);
    return { success: true, registry };
  }

  @Post(':id/update')
  async updateRegistry(
    @Param('id') id: string,
    @Body() dto: UpdateRegistryDto,
  ) {
    const registry = await this.registryService.updateRegistry(id, dto);
    return { success: true, registry };
  }
}
