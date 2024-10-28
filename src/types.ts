import { type OpenmrsResource } from '@openmrs/esm-framework';

export interface ContentPackage {
  [key: string]: AppConfig;
}

export interface AppConfig {
  extensionSlots: ExtensionSlots;
}

export interface SlotConfiguration {
  add?: string[];
  configure?: {
    [key: string]:
      | {
          title?: string;
          slotName?: string;
          isExpanded?: boolean;
          path?: string;
          tabDefinitions?: TabDefinition[];
          'Translation overrides'?: TranslationOverrides;
        }
      | DashboardConfig;
  };
  'Translation overrides'?: TranslationOverrides;
}

interface ExtensionSlots {
  [slotName: string]: SlotConfiguration;
}

type TranslationOverrides = {
  [language: string]: {
    [key: string]: string;
  };
};

export interface ActionOption {
  formName: string;
  label: string;
  mode: 'view' | 'edit';
  package?: string;
}

export interface Column {
  id: string;
  title: string;
  concept?: string;
  isDate?: boolean;
  isLink?: boolean;
  type?: string;
  statusColorMappings?: {
    [key: string]: string;
  };
  actionOptions?: ActionOption[];
}

export interface TabDefinition {
  id?: any;
  tabName: string;
  title?: string;
  headerTitle: string;
  displayText: string;
  encounterType: string;
  hasFilter?: boolean;
  columns: Column[];
  launchOptions: {
    displayText: string;
  };
  formList: Array<{ uuid: string }>;
}

export interface DashboardConfig {
  title: string;
  path: string;
  slot: string;
}

export interface ExtensionSlot {
  add?: string[];
  configure?: {
    [key: string]: {
      title: string;
      slotName: string;
      isExpanded?: boolean;
      tabDefinitions?: TabDefinition[];
      tilesDefinitions?: TilesDefinition[];
      'Translation overrides'?: TranslationOverrides;
    };
  };
}

export interface DynamicExtensionSlot {
  add?: string[];
  configure?: {
    [key: string]: {
      title: string;
      slot: string;
      path: string;
      tabDefinitions?: TabDefinition[];
    };
  };
}

export interface Schema {
  $schema?: string;
  id?: string;
  '@openmrs/esm-patient-chart-app': {
    extensionSlots: {
      'patient-chart-dashboard-slot': ExtensionSlot;
      [key: string]: DynamicExtensionSlot | ExtensionSlot;
    };
  };
}

export interface EncounterType {
  uuid: string;
  name: string;
}

export interface Form {
  uuid: string;
  name: string;
  encounterType: EncounterType;
  version: string;
  resources: Array<Resource>;
  description: string;
  published?: boolean;
  retired?: boolean;
  formFields?: Array<string>;
  display?: string;
  auditInfo: AuditInfo;
}

export interface Resource {
  uuid: string;
  name: string;
  dataType: string;
  valueReference: string;
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: ChangedBy;
  dateChanged: string;
}

interface Creator {
  display: string;
}

interface ChangedBy {
  uuid: string;
  display: string;
}

export interface FormSchema {
  name: string;
  pages: Array<{
    label: string;
    sections: Array<{
      label: string;
      isExpanded: string;
      questions: Array<{
        id: string;
        label: string;
        type: string;
        questionOptions: {
          type?: string;
          concept?: string;
          answers?: Array<Record<string, string>>;
          max?: string;
          min?: string;
          conceptMappings?: Array<Record<string, string>>;
        };
        validators?: Array<Record<string, string>>;
      }>;
    }>;
  }>;
  processor: string;
  uuid: string;
  encounterType: string;
  referencedForms: Array<ReferencedForm>;
  version?: string;
  description?: string;
  encounter?: string | OpenmrsEncounter;
  allowUnspecifiedAll?: boolean;
  defaultPage?: string;
  readonly?: string | boolean;
  inlineRendering?: 'single-line' | 'multiline' | 'automatic';
  markdown?: unknown;
  postSubmissionActions?: Array<{ actionId: string; config?: Record<string, unknown> }>;
  formOptions?: {
    usePreviousValueDisabled: boolean;
  };
  translations?: Record<string, string>;
}

export interface OpenmrsEncounter {
  uuid?: string;
  encounterDatetime?: string | Date;
  patient?: OpenmrsResource | string;
  location?: OpenmrsResource | string;
  encounterType?: OpenmrsResource | string;
  obs?: Array<OpenmrsObs>;
  orders?: Array<OpenmrsResource>;
  voided?: boolean;
  visit?: OpenmrsResource | string;
  encounterProviders?: Array<Record<string, any>>;
  form?: OpenmrsFormResource;
}

export interface OpenmrsObs extends OpenmrsResource {
  concept: any;
  obsDatetime: string | Date;
  obsGroup: OpenmrsObs;
  groupMembers: Array<OpenmrsObs>;
  comment: string;
  location: OpenmrsResource;
  order: OpenmrsResource;
  encounter: OpenmrsResource;
  voided: boolean;
  value: any;
  formFieldPath: string;
  formFieldNamespace: string;
  status: string;
  interpretation: string;
}

export interface OpenmrsForm {
  uuid: string;
  name: string;
  encounterType: OpenmrsResource;
  version: string;
  description: string;
  published: boolean;
  retired: boolean;
  resources: Array<OpenmrsFormResource>;
}

export interface OpenmrsFormResource extends OpenmrsResource {
  dataType?: string;
  valueReference?: string;
}

export interface ReferencedForm {
  formName: string;
  alias: string;
}

export interface TilesDefinition {
  tilesHeader: string;
  columns: Column[];
}

export enum DefinitionTypes {
  TAB_DEFINITION = 'tabDefinitions',
  TILE_DEFINITION = 'tilesDefinitions',
}

export enum WidgetTypes {
  ENCOUNTER_LIST_TABLE_TABS = 'encounter-list-table-tabs',
  PROGRAM_SUMMARY = 'program-summary',
}
