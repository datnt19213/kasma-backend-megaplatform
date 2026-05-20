import { UnauthorizedException } from '@nestjs/common';

export interface SocialCtx {
  app_key: string;
  tenant_key: string;
}

interface RequestUser {
  id?: string;
  sub?: string;
  app_key?: string;
  tenant_key?: string;
}

export interface SocialAuthRequest extends Request {
  user?: RequestUser;
}

export function resolveSocialContext(req: SocialAuthRequest): { userId: string; ctx: SocialCtx } {
  const userId = req.user?.id || req.user?.sub;
  if (!userId) {
    throw new UnauthorizedException('User identity missing');
  }

  const headerApp = req.headers['x-app-kasma-id'];
  const headerTenant = req.headers['x-tenant-kasma-id'];

  const ctx: SocialCtx = {
    app_key:
      req.user?.app_key ||
      (Array.isArray(headerApp) ? headerApp[0] : headerApp) ||
      'MASTER',
    tenant_key:
      req.user?.tenant_key ||
      (Array.isArray(headerTenant) ? headerTenant[0] : headerTenant) ||
      'MASTER',
  };

  return { userId, ctx };
}
