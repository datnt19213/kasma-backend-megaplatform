import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EncryptedPayload {
  content_ciphertext: string;
  content_iv: string;
  content_auth_tag: string;
}

@Injectable()
export class MessageEncryptionService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const secret =
      this.configService.get<string>('MESSAGE_ENCRYPTION_KEY') ||
      process.env.MESSAGE_ENCRYPTION_KEY ||
      'kasma-default-message-encryption-key-change-in-production';
    this.key = scryptSync(secret, 'kasma-message-salt', 32);
  }

  encrypt(plaintext: string): EncryptedPayload {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      content_ciphertext: encrypted.toString('base64'),
      content_iv: iv.toString('base64'),
      content_auth_tag: authTag.toString('base64'),
    };
  }

  decrypt(payload: EncryptedPayload): string {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(payload.content_iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(payload.content_auth_tag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.content_ciphertext, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}
