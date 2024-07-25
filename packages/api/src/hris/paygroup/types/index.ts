import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedHrisPaygroupInput, UnifiedHrisPaygroupOutput } from './model.unified';
import { OriginalPayGroupOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface IPayGroupService {
  addPayGroup(
    paygroupData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalPayGroupOutput>>;

  syncPayGroups(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalPayGroupOutput[]>>;
}

export interface IPayGroupMapper {
  desunify(
    source: UnifiedHrisPaygroupInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalPayGroupOutput | OriginalPayGroupOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisPaygroupOutput | UnifiedHrisPaygroupOutput[]>;
}
