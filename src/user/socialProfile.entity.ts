import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { UserEntity } from './user.entity';

@Entity()
export class SocialProfileEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(
    type => UserEntity,
    user => user.socials,
  )
  user: UserEntity;

  @Column()
  socialId: string;

  @Column()
  socialName: string;
}
