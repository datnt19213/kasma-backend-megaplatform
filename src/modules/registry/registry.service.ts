import { KasmaModule } from '@/entities/kasma-module.entity';
import { KasmaRegistry } from '@/entities/kasma-registry.entity';
import {
  CreateModuleDto,
  CreateRegistryDto,
  UpdateRegistryDto,
} from '@/dto/registry.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

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

  async findAllRegistries(appFamilyKey?: string, tenantKey?: string): Promise<KasmaRegistry[]> {
    const where: any = {};
    if (appFamilyKey) where.app_family_key = appFamilyKey;
    if (tenantKey) where.tenant_key = tenantKey;
    return await this.registryRepository.find({ where });
  }

  private getTransitiveDependencies(targetKey: string, allModules: KasmaModule[]): string[] {
    const moduleMap = new Map(allModules.map((m) => [m.key, m]));
    const dependencies = new Set<string>();
    const queue = [targetKey];

    while (queue.length > 0) {
      const currentKey = queue.shift()!;
      const moduleInfo = moduleMap.get(currentKey);

      if (moduleInfo && moduleInfo.dependencies) {
        for (const dep of moduleInfo.dependencies) {
          if (!dependencies.has(dep)) {
            dependencies.add(dep);
            queue.push(dep);
          }
        }
      }
    }
    return Array.from(dependencies);
  }

  private getTransitiveDependents(targetKey: string, allModules: KasmaModule[]): string[] {
    const dependents = new Set<string>();
    let added = true;

    while (added) {
      added = false;
      for (const m of allModules) {
        if (!dependents.has(m.key) && m.dependencies && m.dependencies.length > 0) {
          const hasDep =
            m.dependencies.includes(targetKey) ||
            m.dependencies.some((d) => dependents.has(d));
          if (hasDep) {
            dependents.add(m.key);
            added = true;
          }
        }
      }
    }
    return Array.from(dependents);
  }

  async createRegistry(dto: CreateRegistryDto): Promise<KasmaRegistry> {
    const { app_family_key, tenant_key, module_key } = dto;

    const allModules = await this.moduleRepository.find();
    const moduleInfo = allModules.find((m) => m.key === module_key);

    if (!moduleInfo) {
      throw new NotFoundException(`Module '${module_key}' không tồn tại trên hệ thống!`);
    }

    const requiredDeps = this.getTransitiveDependencies(module_key, allModules);

    if (requiredDeps.length > 0) {
      const installedDeps = await this.registryRepository.find({
        where: {
          app_family_key,
          tenant_key,
          module_key: In(requiredDeps),
          is_active: true,
        },
      });

      const installedDepKeys = installedDeps.map((r) => r.module_key);
      const missingDeps = requiredDeps.filter((dep) => !installedDepKeys.includes(dep));

      if (missingDeps.length > 0) {
        throw new BadRequestException(
          `Không thể thêm module '${module_key}'. Bạn cần phải có các module sau trước: ${missingDeps.join(', ')}`,
        );
      }
    }

    const registry = this.registryRepository.create(dto);
    return await this.registryRepository.save(registry);
  }

  async updateRegistry(id: string, dto: UpdateRegistryDto): Promise<KasmaRegistry> {
    const registry = await this.registryRepository.findOne({ where: { id } });
    if (!registry) {
      throw new NotFoundException(`Registry with ID ${id} not found`);
    }

    if (dto.is_active === false && registry.is_active === true) {
      const allModules = await this.moduleRepository.find();
      const dependentModules = this.getTransitiveDependents(registry.module_key, allModules);

      if (dependentModules.length > 0) {
        const activeDependents = await this.registryRepository.find({
          where: {
            app_family_key: registry.app_family_key,
            tenant_key: registry.tenant_key,
            module_key: In(dependentModules),
            is_active: true,
          },
        });

        if (activeDependents.length > 0) {
          const causingKeys = activeDependents.map((r) => r.module_key).join(', ');
          throw new BadRequestException(
            `Bạn không thể tắt/xóa module '${registry.module_key}' vì các module sau đang phụ thuộc vào nó: ${causingKeys}`,
          );
        }
      }
    }

    Object.assign(registry, dto);
    return await this.registryRepository.save(registry);
  }

  async checkAccess(
    appFamilyKey: string,
    tenantKey: string,
    moduleKey: string,
  ): Promise<{ allowed: boolean; version?: string }> {
    if (!appFamilyKey || !tenantKey || !moduleKey) {
      return { allowed: false };
    }

    const registration = await this.registryRepository.findOne({
      where: {
        app_family_key: appFamilyKey,
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
