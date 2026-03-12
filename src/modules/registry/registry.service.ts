import { KasmaModule } from '@/entities/kasma-module.entity';
import { KasmaRegistry } from '@/entities/kasma-registry.entity';
import {
  CreateModuleDto,
  CreateRegistryDto,
  UpdateRegistryDto,
} from '@/dto/registry.dto';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RegistryService {
  constructor(
    @InjectRepository(KasmaModule, 'postgres')
    private readonly moduleRepository: Repository<KasmaModule>,
    @InjectRepository(KasmaRegistry, 'postgres')
    private readonly registryRepository: Repository<KasmaRegistry>,
  ) { }

  // ─── Module Management ───────────────────────────────────────────────────

  async findAllModules(): Promise<KasmaModule[]> {
    return await this.moduleRepository.find();
  }

  async createModule(dto: CreateModuleDto): Promise<KasmaModule> {
    const module = this.moduleRepository.create(dto);
    return await this.moduleRepository.save(module);
  }

  // ─── Registry Management ─────────────────────────────────────────────────

  async findAllRegistries(appKey?: string, tenantKey?: string): Promise<KasmaRegistry[]> {
    const where: any = {};
    if (appKey) where.app_key = appKey;
    if (tenantKey) where.tenant_key = tenantKey;
    return await this.registryRepository.find({ where });
  }

  async createRegistry(dto: CreateRegistryDto): Promise<KasmaRegistry> {
    const registry = this.registryRepository.create(dto);
    return await this.registryRepository.save(registry);
  }

  async updateRegistry(id: string, dto: UpdateRegistryDto): Promise<KasmaRegistry> {
    const registry = await this.registryRepository.findOne({ where: { id } });
    if (!registry) {
      throw new NotFoundException(`Registry with ID ${id} not found`);
    }
    Object.assign(registry, dto);
    return await this.registryRepository.save(registry);
  }

  async checkAccess(
    appKey: string,
    tenantKey: string,
    moduleKey: string,
  ): Promise<{ allowed: boolean; version?: string }> {
    if (!appKey || !tenantKey || !moduleKey) {
      return { allowed: false };
    }

    const registration = await this.registryRepository.findOne({
      where: {
        app_key: appKey,
        tenant_key: tenantKey,
        module_key: moduleKey,
        is_active: true,
      },
    });

    if (!registration) {
      return { allowed: false };
    }

    return {
      allowed: true,
      version: registration.version,
    };
  }
}
