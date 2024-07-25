import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { LoggerService } from '../@core-services/logger/logger.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import {
  ApiBody,
  ApiExcludeController,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('organisations')
@ApiExcludeController()
@Controller('organisations')
export class OrganisationsController {
  constructor(
    private readonly organizationsService: OrganisationsService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(OrganisationsController.name);
  }

  @ApiOperation({
    operationId: 'getOrganisations',
    summary: 'Retrieve Organisations',
  })
  @Get()
  getOragnisations() {
    return; //this.organizationsService.getOrganisations();
  }

  @ApiOperation({
    operationId: 'createOrganisation',
    summary: 'Create an Organisation',
  })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({ status: 201 })
  @Post('create')
  createOrg(@Body() orgCreateDto: CreateOrganizationDto) {
    return; //this.organizationsService.createOrganization(orgCreateDto);
  }
}
