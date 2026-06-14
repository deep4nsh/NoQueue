import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto, ReorderServicesDto } from './dto/update-service.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/user.schema';

@ApiTags('service')
@ApiBearerAuth()
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a service for a business' })
  create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List services for a business, optionally filtered by branch' })
  @ApiQuery({ name: 'businessId', required: true })
  @ApiQuery({ name: 'branchId', required: false })
  findAll(
    @Query('businessId') businessId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.serviceService.findAll(businessId, branchId);
  }

  @Public()
  @Get('grouped')
  @ApiOperation({ summary: 'List services grouped by category' })
  @ApiQuery({ name: 'businessId', required: true })
  findGrouped(@Query('businessId') businessId: string) {
    return this.serviceService.findByCategory(businessId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single service by ID' })
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch('reorder')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Reorder services by providing an ordered array of IDs' })
  reorder(@Body() dto: ReorderServicesDto) {
    return this.serviceService.reorder(dto);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a service' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.serviceService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Soft-delete a service (sets isActive = false)' })
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
