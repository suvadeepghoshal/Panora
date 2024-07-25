import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingCompanyinfoInput,
  UnifiedAccountingCompanyinfoOutput,
} from './model.unified';
import { OriginalCompanyInfoOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ICompanyInfoService {
  addCompanyInfo(
    companyinfoData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCompanyInfoOutput>>;

  syncCompanyInfos(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCompanyInfoOutput[]>>;
}

export interface ICompanyInfoMapper {
  desunify(
    source: UnifiedAccountingCompanyinfoInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCompanyInfoOutput | OriginalCompanyInfoOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingCompanyinfoOutput | UnifiedAccountingCompanyinfoOutput[]>;
}
