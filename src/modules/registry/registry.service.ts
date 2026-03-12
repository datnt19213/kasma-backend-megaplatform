import { KasmaRegistry } from '@/entities/kasma-registry.entity';
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RegistryService {
  constructor(
    @InjectRepository(KasmaRegistry, 'postgres')
    private readonly registryRepository: Repository<KasmaRegistry>,
  ) { }

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
