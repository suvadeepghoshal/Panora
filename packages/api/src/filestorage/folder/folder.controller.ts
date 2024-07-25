import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Param,
  Headers,
  UseGuards,
  UsePipes,
  ValidationPipe,
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

import { FolderService } from './services/folder.service';
import {
  UnifiedFilestorageFolderInput,
  UnifiedFilestorageFolderOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
  ApiPostCustomResponse,
} from '@@core/utils/dtos/openapi.respone.dto';
import { example } from 'yargs';

@ApiBearerAuth('bearer')
@ApiTags('filestorage/folders')
@Controller('filestorage/folders')
export class FolderController {
  constructor(
    private readonly folderService: FolderService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(FolderController.name);
  }

  @ApiOperation({
    operationId: 'listFilestorageFolder',
    summary: 'List a batch of Folders',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedFilestorageFolderOutput)
  @UseGuards(ApiKeyAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: true }))
  @Get()
  async getFolders(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.folderService.getFolders(
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
    operationId: 'retrieveFilestorageFolder',
    summary: 'Retrieve a Folder',
    description: 'Retrieve a folder from any connected Filestorage software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the folder you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original File Storage software.',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedFilestorageFolderOutput)
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
    return this.folderService.getFolder(
      id,
      linkedUserId,
      remoteSource,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'createFilestorageFolder',
    summary: 'Create a Folder',
    description: 'Create a folder in any supported Filestorage software',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiBody({ type: UnifiedFilestorageFolderInput })
  @ApiPostCustomResponse(UnifiedFilestorageFolderOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addFolder(
    @Body() unifiedFolderData: UnifiedFilestorageFolderInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.folderService.addFolder(
        unifiedFolderData,
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
