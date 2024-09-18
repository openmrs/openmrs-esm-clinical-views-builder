import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  showSchemaSaveWarning: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Whether to show a warning about possibly losing data in the forms dashboard',
  },
};

export interface ConfigObject {
  showSchemaSaveWarning: boolean;
}
