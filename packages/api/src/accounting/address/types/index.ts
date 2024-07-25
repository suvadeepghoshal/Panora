import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAccountingAddressInput, UnifiedAccountingAddressOutput } from './model.unified';
import { OriginalAddressOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IAddressService {
  addAddress(
    addressData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalAddressOutput>>;

  syncAddresss(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalAddressOutput[]>>;
}

export interface IAddressMapper {
  desunify(
    source: UnifiedAccountingAddressInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalAddressOutput | OriginalAddressOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingAddressOutput | UnifiedAccountingAddressOutput[]>;
}
