import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../user/user.schema';

@ApiTags('branch')
@ApiBearerAuth()
@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new branch' })
  async create(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get branch by ID' })
  async findOne(@Param('id') id: string) {
    return this.branchService.findById(id);
  }

  @Get('business/:businessId')
  @Roles(Role.OWNER, Role.RECEPTIONIST, Role.ADMIN)
  @ApiOperation({ summary: 'Get all branches for a business' })
  async findByBusiness(@Param('businessId') businessId: string) {
    return this.branchService.findByBusiness(businessId);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update branch' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateBranchDto>) {
    return this.branchService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete branch (soft delete)' })
  async delete(@Param('id') id: string) {
    await this.branchService.delete(id);
    return { success: true };
  }

  @Post(':id/staff')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Add staff to branch' })
  async addStaff(@Param('id') id: string, @Body() { staffIds }: { staffIds: string[] }) {
    return this.branchService.addStaff(id, staffIds);
  }

  @Delete(':id/staff/:staffId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Remove staff from branch' })
  async removeStaff(@Param('id') id: string, @Param('staffId') staffId: string) {
    return this.branchService.removeStaff(id, staffId);
  }

  @Get(':id/qr')
  @Public()
  @ApiOperation({ summary: 'Generate QR code for branch' })
  async generateQR(@Param('id') id: string) {
    const qrCode = await this.branchService.generateQRCode(id);
    return { qrCode };
  }
}
