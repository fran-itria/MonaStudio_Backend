import { Module } from '@nestjs/common';
import { VaritiesService } from './varities.service';
import { VaritiesController } from './varities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Varity } from './entities/varity.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Varity]), AuthModule],
  controllers: [VaritiesController],
  providers: [VaritiesService],
})
export class VaritiesModule { }
