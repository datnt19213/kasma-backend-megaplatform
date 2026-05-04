import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

import { MediaProviderKey } from '@/config/apps';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadResult {
  url: string;
  provider: MediaProviderKey;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class MediaLibraryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    providerKey: MediaProviderKey,
    ctx: { app_key: string; tenant_key: string }
  ): Promise<UploadResult> {
    if (providerKey === MediaProviderKey.CLOUDINARY) {
      return this.uploadToCloudinary(file, ctx);
    } else {
      return this.uploadToKedia(file, ctx);
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    ctx: { app_key: string; tenant_key: string }
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const folderPath = `kasma_media/${ctx.tenant_key}/${ctx.app_key}`;
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderPath },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed'));

          resolve({
            url: result.secure_url,
            provider: MediaProviderKey.CLOUDINARY,
            metadata: result as unknown as Record<string, unknown>,
          });
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  }

  private async uploadToKedia(
    file: Express.Multer.File,
    ctx: { app_key: string; tenant_key: string }
  ): Promise<UploadResult> {
    // Simulated Kasma Media (KEDIA) upload logic
    console.log(`Uploading to KEDIA for tenant ${ctx.tenant_key}...`, file.originalname);
    return {
      url: `https://media.kasma.com/storage/${Date.now()}_${file.originalname}`,
      provider: MediaProviderKey.KEDIA,
    };
  }
}
