import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role, UserDocument } from '../user/user.schema';

@ApiTags('business')
@ApiBearerAuth()
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new business' })
  async create(@Body() dto: CreateBusinessDto, @CurrentUser() user: UserDocument) {
    return this.businessService.create(dto, user._id.toString());
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.RECEPTIONIST, Role.ADMIN)
  @ApiOperation({ summary: 'Get business by ID' })
  async findOne(@Param('id') id: string) {
    return this.businessService.findById(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get business by slug (for public queue access)' })
  async findBySlug(@Param('slug') slug: string) {
    const business = await this.businessService.findBySlug(slug);
    if (!business) {
      return { error: 'Business not found' };
    }
    return business;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: "Get all businesses owned by current user or all (if admin)" })
  async findAll(@CurrentUser() user: UserDocument) {
    if (user.role === Role.ADMIN) {
      return this.businessService.findAll();
    }
    return this.businessService.findByOwner(user._id.toString());
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update business' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateBusinessDto>) {
    return this.businessService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete business (admin only)' })
  async delete(@Param('id') id: string) {
    await this.businessService.delete(id);
    return { success: true };
  }
}
