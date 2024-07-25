import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisEmployerbenefitInput,
  UnifiedHrisEmployerbenefitOutput,
} from './model.unified';
import { OriginalEmployerBenefitOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface IEmployerBenefitService {
  addEmployerBenefit(
    employerbenefitData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalEmployerBenefitOutput>>;

  syncEmployerBenefits(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalEmployerBenefitOutput[]>>;
}

export interface IEmployerBenefitMapper {
  desunify(
    source: UnifiedHrisEmployerbenefitInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEmployerBenefitOutput | OriginalEmployerBenefitOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisEmployerbenefitOutput | UnifiedHrisEmployerbenefitOutput[]>;
}
