import {
  BaseEntity,
  Column,
  Entity,
  BeforeInsert,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { createHmac } from 'crypto';

import { SocialProfileEntity } from './SocialProfile.entity';
import config from '../config.json';

const hmac = createHmac('sha256', config.salt);

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, default: '' })
  email: string;

  @Column({ length: 100, default: '' })
  name: string;

  @Column({ length: 50, default: '' })
  login: string;

  @Column({ length: 250, default: '' })
  password: string;

  @OneToMany(
    type => SocialProfileEntity,
    social => social.user,
    { cascade: true },
  )
  socials: SocialProfileEntity[];

  @BeforeInsert()
  hashPassword() {
    if (this.password) {
      this.password = hmac.update(this.password).digest('hex');
    }
  }

  checkPassword(password: string) {
    return this.password === hmac.update(password).digest('hex');
  }
}
