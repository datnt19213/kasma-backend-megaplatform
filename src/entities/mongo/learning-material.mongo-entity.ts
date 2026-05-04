import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

export enum MaterialType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  SCORM = 'SCORM',
  SLIDE = 'SLIDE',
  AUDIO = 'AUDIO',
}

@Entity('learning_materials')
export class LearningMaterial {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  lesson_id: string;

  @Column({
    type: 'enum',
    enum: MaterialType,
  })
  type: MaterialType;

  @Column('json')
  content_data: {
    url: string;
    provider: string; // KEDIA or CLOUDINARY
    provider_metadata?: any;
    duration?: number;
    size?: number;
    mime_type?: string;
  };

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
