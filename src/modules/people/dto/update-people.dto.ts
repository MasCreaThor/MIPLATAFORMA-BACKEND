// src/modules/people/dto/update-people.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePeopleDto } from './create-people.dto';

export class UpdatePeopleDto extends PartialType(CreatePeopleDto) {}