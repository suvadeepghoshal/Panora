import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { UnifiedCrmCompanyOutput } from '../types/model.unified';
import { ICompanyService } from '../types';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.crm';
import { crm_companies as CrmCompany } from '@prisma/client';
import { CRM_PROVIDERS } from '@panora/shared';
import { Utils } from '@crm/@lib/@utils';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private utils: Utils,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('crm', 'company', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'crm-sync-companies',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  //function used by sync worker which populate our crm_companies table
  //its role is to fetch all companies from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log(`Syncing companies....`);
      const users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: {
              id_user: user.id_user,
            },
          });
          for (const project of projects) {
            const id_project = project.id_project;
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: {
                id_project: id_project,
              },
            });
            linkedUsers.map(async (linkedUser) => {
              try {
                const providers = CRM_PROVIDERS.filter(
                  (provider) => provider !== 'zoho',
                );
                for (const provider of providers) {
                  try {
                    await this.syncForLinkedUser({
                      integrationId: provider,
                      linkedUserId: linkedUser.id_linked_user,
                    });
                  } catch (error) {
                    throw error;
                  }
                }
              } catch (error) {
                throw error;
              }
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: ICompanyService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedCrmCompanyOutput,
        OriginalCompanyOutput,
        ICompanyService
      >(integrationId, linkedUserId, 'crm', 'company', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedCrmCompanyOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmCompany[]> {
    try {
      const companies_results: CrmCompany[] = [];

      const updateOrCreateCompany = async (
        company: UnifiedCrmCompanyOutput,
        originId: string,
      ) => {
        const existingCompany = await this.prisma.crm_companies.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
          include: {
            crm_email_addresses: true,
            crm_phone_numbers: true,
            crm_addresses: true,
          },
        });

        const { normalizedEmails, normalizedPhones } =
          this.utils.normalizeEmailsAndNumbers(
            company.email_addresses,
            company.phone_numbers,
          );

        const normalizedAddresses = this.utils.normalizeAddresses(
          company.addresses,
        );

        const baseData: any = {
          name: company.name ?? null,
          industry: company.industry ?? null,
          number_of_employees: company.number_of_employees ?? null,
          id_crm_user: company.user_id ?? null,
          modified_at: new Date(),
        };

        if (existingCompany) {
          const res = await this.prisma.crm_companies.update({
            where: {
              id_crm_company: existingCompany.id_crm_company,
            },
            data: baseData,
          });

          if (normalizedEmails && normalizedEmails.length > 0) {
            await Promise.all(
              normalizedEmails.map((email, index) => {
                if (
                  existingCompany &&
                  existingCompany.crm_email_addresses[index]
                ) {
                  return this.prisma.crm_email_addresses.update({
                    where: {
                      id_crm_email:
                        existingCompany.crm_email_addresses[index].id_crm_email,
                    },
                    data: email,
                  });
                } else {
                  return this.prisma.crm_email_addresses.create({
                    data: {
                      ...email,
                      id_crm_company: existingCompany.id_crm_company,
                      id_connection: connection_id,
                    },
                  });
                }
              }),
            );
          }
          if (normalizedPhones && normalizedPhones.length > 0) {
            await Promise.all(
              normalizedPhones.map((phone, index) => {
                if (
                  existingCompany &&
                  existingCompany.crm_phone_numbers[index]
                ) {
                  return this.prisma.crm_phone_numbers.update({
                    where: {
                      id_crm_phone_number:
                        existingCompany.crm_phone_numbers[index]
                          .id_crm_phone_number,
                    },
                    data: phone,
                  });
                } else {
                  return this.prisma.crm_phone_numbers.create({
                    data: {
                      ...phone,
                      id_crm_company: existingCompany.id_crm_company,
                      id_connection: connection_id,
                    },
                  });
                }
              }),
            );
          }
          if (normalizedAddresses && normalizedAddresses.length > 0) {
            await Promise.all(
              normalizedAddresses.map((addy, index) => {
                if (existingCompany && existingCompany.crm_addresses[index]) {
                  return this.prisma.crm_addresses.update({
                    where: {
                      id_crm_address:
                        existingCompany.crm_addresses[index].id_crm_address,
                    },
                    data: addy,
                  });
                } else {
                  return this.prisma.crm_addresses.create({
                    data: {
                      ...addy,
                      id_crm_company: existingCompany.id_crm_company,
                      id_connection: connection_id,
                    },
                  });
                }
              }),
            );
          }
          return res;
        } else {
          const uuid = uuidv4();
          const newCompany = await this.prisma.crm_companies.create({
            data: {
              ...baseData,
              id_crm_company: uuid,
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });

          if (normalizedEmails && normalizedEmails.length > 0) {
            await Promise.all(
              normalizedEmails.map((email) =>
                this.prisma.crm_email_addresses.create({
                  data: {
                    ...email,
                    id_crm_company: newCompany.id_crm_company,
                    id_connection: connection_id,
                  },
                }),
              ),
            );
          }

          if (normalizedPhones && normalizedPhones.length > 0) {
            await Promise.all(
              normalizedPhones.map((phone) =>
                this.prisma.crm_phone_numbers.create({
                  data: {
                    ...phone,
                    id_crm_company: newCompany.id_crm_company,
                    id_connection: connection_id,
                  },
                }),
              ),
            );
          }

          if (normalizedAddresses && normalizedAddresses.length > 0) {
            await Promise.all(
              normalizedAddresses.map((addy) =>
                this.prisma.crm_addresses.create({
                  data: {
                    ...addy,
                    id_crm_company: newCompany.id_crm_company,
                    id_connection: connection_id,
                  },
                }),
              ),
            );
          }
          return newCompany;
        }
      };

      for (let i = 0; i < data.length; i++) {
        const company = data[i];
        const originId = company.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateCompany(company, originId);
        const company_id = res.id_crm_company;
        companies_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          company.field_mappings,
          company_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(company_id, remote_data[i]);
      }
      return companies_results;
    } catch (error) {
      throw error;
    }
  }
}
