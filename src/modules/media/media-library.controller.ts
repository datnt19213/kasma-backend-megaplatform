import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { MediaProviderKey } from '@/config/apps';
import { MediaLibraryService } from '@/modules/media/media-library.service';
import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/media')
@UseGuards(JwtAuthGuard)
export class MediaLibraryController {
  constructor(private readonly mediaService: MediaLibraryService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('provider') provider: MediaProviderKey = MediaProviderKey.KEDIA,
    @Req() req: RequestWithUser,
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.mediaService.uploadFile(file, provider, ctx);
  }
}
