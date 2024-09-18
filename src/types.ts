export interface ContentPackage {
  [key: string]: AppConfig;
}

export interface AppConfig {
  extensionSlots: ExtensionSlots;
}

interface SlotConfiguration {
  add: string[];
  configure: {
    [key: string]:
      | {
          title?: string;
          slotName?: string;
          isExpanded?: boolean;
          tabDefinitions?: TabDefinition[];
        }
      | DashboardConfig;
  };
  'Translation overrides': TranslationOverrides;
}

interface ExtensionSlots {
  [slotName: string]: SlotConfiguration;
}

type TranslationOverrides = {
  [language: string]: {
    [key: string]: string;
  };
};

interface ActionOption {
  formName: string;
  label: string;
  mode: 'view' | 'edit';
  package?: string;
}

interface Column {
  id: string;
  title: string;
  concept: string;
  isDate?: boolean;
  isLink?: boolean;
  type?: string;
  statusColorMappings?: {
    [key: string]: string;
  };
  actionOptions?: ActionOption[];
}

interface TabDefinition {
  tabName: string;
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

interface DashboardConfig {
  title: string;
  path: string;
  slot: string;
}
