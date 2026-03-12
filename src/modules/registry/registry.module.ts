import { KasmaModule } from '@/entities/kasma-module.entity';
import { KasmaRegistry } from '@/entities/kasma-registry.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegistryService } from './registry.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([KasmaModule, KasmaRegistry], 'postgres'),
  ],
  providers: [RegistryService],
  exports: [RegistryService],
})
export class RegistryModule { }
