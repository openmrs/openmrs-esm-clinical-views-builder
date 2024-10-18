import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import ConfigureDashboardModal from './add-columns-modal.component';
import { showSnackbar } from '@openmrs/esm-framework';
import { DefinitionTypes } from '../../types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  isDesktop: jest.fn(() => true),
  showSnackbar: jest.fn(),
  useLayoutType: jest.fn(() => 'desktop'),
}));

jest.mock('../../hooks/useForm', () => ({
  useForms: jest.fn(() => ({
    isLoadingForm: false,
    forms: [{ display: 'Form 1' }],
    formsError: null,
  })),
}));

jest.mock('../../hooks/useFormConcepts', () => ({
  useFormConcepts: jest.fn(() => ({
    isLoadingFormConcepts: false,
    formConcepts: [{ concept: 'concept1', label: 'Concept 1' }],
    formConceptsError: null,
    mutate: jest.fn(),
  })),
}));

jest.mock('../../hooks/useEncounter', () => ({
  useEncounterTypes: jest.fn(() => ({
    isLoading: false,
    encounterTypes: [{ uuid: 'encounter1', display: 'Encounter 1' }],
    encounterTypesError: null,
  })),
}));

jest.mock('../../helpers', () => ({
  generateNodeId: jest.fn(() => 'generated-id'),
}));

const mockProps = {
  schema: {
    '@openmrs/esm-patient-chart-app': {
      extensionSlots: {
        'patient-chart-dashboard-slot': {
          add: [],
          configure: {
            slot1: {
              title: 'Slot 1 Title',
              slotName: 'slot1',
              tabDefinitions: [
                {
                  id: 'tab1',
                  tabName: 'Tab 1',
                  headerTitle: 'Tab 1 Header',
                  displayText: 'Display Text for Tab 1',
                  encounterType: 'Encounter 1',
                  hasFilter: false,
                  columns: [],
                  launchOptions: { displayText: 'Launch Tab 1' },
                  formList: [],
                },
              ],
            },
          },
        },
        slot1: {
          add: [],
          configure: {
            slot1: {
              title: 'Slot 1 Title',
              slotName: 'slot1',
              tabDefinitions: [
                {
                  id: 'tab1',
                  tabName: 'Tab 1',
                  headerTitle: 'Tab 1 Header',
                  displayText: 'Display Text for Tab 1',
                  encounterType: 'Encounter 1',
                  hasFilter: false,
                  columns: [],
                  launchOptions: { displayText: 'Launch Tab 1' },
                  formList: [],
                },
              ],
            },
          },
        },
      },
    },
  },
  onSchemaChange: jest.fn(),
  closeModal: jest.fn(),
  slotDetails: {
    slot: 'slot1',
    title: 'Dashboard Slot 1',
    path: '/dashboard/slot1',
  },
  tabDefinition: {
    id: 'tab1',
    tabName: 'Tab 1',
    headerTitle: 'Tab 1 Header',
    displayText: 'Display Text for Tab 1',
    encounterType: 'Encounter 1',
    columns: [],
    launchOptions: { displayText: 'Launch Tab 1' },
    formList: [],
  },
  definitionType: DefinitionTypes.TAB_DEFINITION,
};

describe('ConfigureDashboardModal', () => {
  const user = userEvent.setup();

  it('renders without crashing', () => {
    render(<ConfigureDashboardModal {...mockProps} />);
    expect(screen.getByText('createNewSubMenu')).toBeInTheDocument();
  });

  it('handles form input changes', async () => {
    render(<ConfigureDashboardModal {...mockProps} />);

    await user.type(screen.getByLabelText('columnTitle'), 'New Column');
    await user.selectOptions(screen.getByLabelText('selectConcept'), 'concept1');
    await user.selectOptions(screen.getByLabelText('selectEncounterType'), 'Encounter 1');

    expect(screen.getByLabelText('columnTitle')).toHaveValue('New Column');
    expect(screen.getByLabelText('selectConcept')).toHaveValue('concept1');
    expect(screen.getByLabelText('selectEncounterType')).toHaveValue('Encounter 1');
  });

  it('calls updateSchema and closeModal on create column', async () => {
    render(<ConfigureDashboardModal {...mockProps} />);

    await user.type(screen.getByLabelText('columnTitle'), 'New Column');
    await user.selectOptions(screen.getByLabelText('selectConcept'), 'concept1');
    await user.selectOptions(screen.getByLabelText('selectEncounterType'), 'Encounter 1');

    await user.click(screen.getByText('createSubMenu'));

    expect(mockProps.onSchemaChange).toHaveBeenCalled();
    expect(mockProps.closeModal).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'success',
      kind: 'success',
      isLowContrast: true,
      subtitle: 'tabColumnsCreated',
    });
  });

  it('shows error snackbar on schema update failure', async () => {
    const errorProps = {
      ...mockProps,
      onSchemaChange: () => {
        throw new Error('Test Error');
      },
    };

    render(<ConfigureDashboardModal {...errorProps} />);

    await user.type(screen.getByLabelText('columnTitle'), 'New Column');
    await user.selectOptions(screen.getByLabelText('selectConcept'), 'concept1');
    await user.selectOptions(screen.getByLabelText('selectEncounterType'), 'Encounter 1');

    await user.click(screen.getByText('createSubMenu'));

    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'errorCreatingTabColumns',
      kind: 'error',
      subtitle: 'Test Error',
    });
  });
});
