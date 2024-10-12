import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  patientUuid: {
    _type: Type.String,
    _description: 'UUID for the patient',
    _default: '6cea3475-67d0-4ce9-b947-7cfd407c9168',
  },
};

export interface ConfigObject {
  patientUuid: string;
}
