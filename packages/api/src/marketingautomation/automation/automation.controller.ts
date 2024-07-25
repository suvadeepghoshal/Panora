import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AutomationService } from './services/automation.service';
import {
  UnifiedMarketingautomationAutomationInput,
  UnifiedMarketingautomationAutomationOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
  ApiPostCustomResponse,
} from '@@core/utils/dtos/openapi.respone.dto';

@ApiBearerAuth('bearer')
@ApiTags('marketingautomation/automation')
@Controller('marketingautomation/automation')
export class AutomationController {
  constructor(
    private readonly automationService: AutomationService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(AutomationController.name);
  }

  @ApiOperation({
    operationId: 'listMarketingautomationAutomation',
    summary: 'List a batch of Automations',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedMarketingautomationAutomationOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getAutomations(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.automationService.getAutomations(
        connectionId,
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieveMarketingautomationAutomation',
    summary: 'Retrieve a Automation',
    description:
      'Retrieve a automation from any connected Marketingautomation software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the automation you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedMarketingautomationAutomationOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    const { linkedUserId, remoteSource } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.automationService.getAutomation(
      id,
      linkedUserId,
      remoteSource,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'createMarketingautomationAutomation',
    summary: 'Create a Automation',
    description:
      'Create a automation in any supported Marketingautomation software',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiBody({ type: UnifiedMarketingautomationAutomationInput })
  @ApiPostCustomResponse(UnifiedMarketingautomationAutomationOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addAutomation(
    @Body() unifiedAutomationData: UnifiedMarketingautomationAutomationInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.automationService.addAutomation(
        unifiedAutomationData,
        connectionId,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
