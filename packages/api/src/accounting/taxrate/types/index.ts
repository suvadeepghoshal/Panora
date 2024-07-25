import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAccountingTaxrateInput, UnifiedAccountingTaxrateOutput } from './model.unified';
import { OriginalTaxRateOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ITaxRateService {
  addTaxRate(
    taxrateData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTaxRateOutput>>;

  syncTaxRates(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTaxRateOutput[]>>;
}

export interface ITaxRateMapper {
  desunify(
    source: UnifiedAccountingTaxrateInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTaxRateOutput | OriginalTaxRateOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingTaxrateOutput | UnifiedAccountingTaxrateOutput[]>;
}
