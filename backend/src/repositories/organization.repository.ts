import { BaseRepository } from './base.repository';
import { Organization, IOrganization } from '@models/Organization.model';

class OrganizationRepository extends BaseRepository<IOrganization> {
  constructor() {
    super(Organization);
  }
}

export const organizationRepository = new OrganizationRepository();
