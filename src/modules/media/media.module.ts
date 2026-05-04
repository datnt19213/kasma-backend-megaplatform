import { MediaLibraryController } from '@/modules/media/media-library.controller';
import { MediaLibraryService } from '@/modules/media/media-library.service';
import { ContentSanitizerService } from './content-sanitizer.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  controllers: [MediaLibraryController],
  providers: [MediaLibraryService, ContentSanitizerService],
  exports: [MediaLibraryService, ContentSanitizerService],
})
export class MediaModule { }
