import { Observable } from 'rxjs';

import { RegistryService } from '@/modules/registry/registry.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { MODULE_KEY } from '../decorators/module.decorator';

@Injectable()
export class RegistryGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly registryService: RegistryService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleKey = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no module key is defined, we allow access (or you can choose to deny by default)
    if (!moduleKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const appKey = request.headers['x-app-kasma-id'];
    const tenantKey = request.headers['x-tenant-kasma-id'];

    if (!appKey || !tenantKey) {
      throw new ForbiddenException('Missing X-App-Kasma-Id or X-Tenant-Kasma-Id headers');
    }

    const { allowed, version } = await this.registryService.checkAccess(
      appKey as string,
      tenantKey as string,
      moduleKey,
    );

    if (!allowed) {
      throw new ForbiddenException(
        `App and Tenant do not have access to module: ${moduleKey}`,
      );
    }

    // Optionally attach version to request for downstream use
    request['module_version'] = version;

    return true;
  }
}
