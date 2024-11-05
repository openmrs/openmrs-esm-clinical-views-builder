import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteConfigDetailModal from './delete-config-detail-modal.component';
import { WidgetTypes } from '../../types';
import userEvent from '@testing-library/user-event';
import { showSnackbar } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockCloseModal = jest.fn();
const mockOnSchemaChange = jest.fn();

const mockProps = {
  closeModal: mockCloseModal,
  schema: {
    '@openmrs/esm-patient-chart-app': {
      extensionSlots: {
        'patient-chart-dashboard-slot': {
          configure: {
            configKey1: {
              title: 'Sample Title',
              slotName: 'sample-slot',
              isExpanded: true,
              tabDefinitions: [
                {
                  id: 'tab1',
                  tabName: 'tab1',
                  headerTitle: 'Header 1',
                  displayText: 'Tab 1',
                  encounterType: 'encounter1',
                  columns: [],
                  launchOptions: { displayText: 'Launch' },
                  formList: [],
                },
              ],
            },
          },
        },
        slot1: {
          configure: {
            configKey1: {
              title: 'Another Title',
              slotName: 'slot1',
              widgetType1: [{ tabName: 'tab1' }],
            },
          },
        },
      },
    },
  },
  onSchemaChange: mockOnSchemaChange,
  slotDetails: {
    title: 'Sample Slot Title',
    path: 'sample/slot/path',
    slot: 'slot1',
  },
  tabDefinition: {
    id: 'tab1',
    tabName: 'tab1',
    headerTitle: 'Header 1',
    displayText: 'Tab 1',
    encounterType: 'encounter1',
    columns: [],
    launchOptions: { displayText: 'Launch' },
    formList: [],
  },
  configurationKey: 'configKey1',
  widgetType: WidgetTypes.ENCOUNTER_LIST_TABLE_TABS,
};

describe('DeleteConfigDetailModal', () => {
  it('renders the modal with correct text', () => {
    render(<DeleteConfigDetailModal {...mockProps} />);

    expect(screen.getByText('deleteConfigDetailsConfirmationText')).toBeInTheDocument();
    expect(screen.getByText('menuSlot : slot1')).toBeInTheDocument();
    expect(screen.getByText('tabName : tab1')).toBeInTheDocument();
    expect(screen.getByText('headerTitle : Header 1')).toBeInTheDocument();
  });

  it('calls closeModal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfigDetailModal {...mockProps} />);

    await user.click(screen.getByText('cancel'));
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('successfully deletes configuration and updates schema when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfigDetailModal {...mockProps} />);
  
    await user.click(screen.getByText('deleteConfiguration'));
    expect(mockOnSchemaChange).toHaveBeenCalledTimes(1);
    expect(mockOnSchemaChange).toHaveBeenCalledWith({
      '@openmrs/esm-patient-chart-app': {
        extensionSlots: {
          'patient-chart-dashboard-slot': {
            configure: {
              configKey1: {
                title: 'Sample Title',
                slotName: 'sample-slot',
                isExpanded: true,
                tabDefinitions: [
                  {
                    id: 'tab1',
                    tabName: 'tab1',
                    headerTitle: 'Header 1',
                    displayText: 'Tab 1',
                    encounterType: 'encounter1',
                    columns: [],
                    launchOptions: { displayText: 'Launch' },
                    formList: [],
                  },
                ],
              },
            },
          },
          slot1: {
            configure: {
              configKey1: {
                'encounter-list-table-tabs': undefined,
                slotName: 'slot1',
                title: 'Another Title',
                widgetType1: [
                  {
                    tabName: 'tab1',
                  },
                ],
              },
            },
          },
        },
      },
    });
  });

  it('displays correct configuration details before deletion', () => {
    render(<DeleteConfigDetailModal {...mockProps} />);
  
    expect(screen.getByText('menuSlot : slot1')).toBeInTheDocument();
    expect(screen.getByText('tabName : tab1')).toBeInTheDocument();
    expect(screen.getByText('headerTitle : Header 1')).toBeInTheDocument();
    expect(screen.getByText('deleteConfiguration')).toBeEnabled();
  });

  it('shows error snackbar when deletion fails', async () => {
    const user = userEvent.setup();
    const errorProps = {
      ...mockProps,
      onSchemaChange: jest.fn().mockImplementation(() => {
        throw new Error('Failed to delete configuration');
      }),
    };
  
    render(<DeleteConfigDetailModal {...errorProps} />);
  
    await user.click(screen.getByText('deleteConfiguration'));
    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'errorDeletingConfiguration',
      kind: 'error',
      subtitle: 'Failed to delete configuration',
    });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('successfully completes the deletion process with proper success indicators', async () => {
    const user = userEvent.setup();
    render(<DeleteConfigDetailModal {...mockProps} />);
    expect(screen.getByText('deleteConfigDetailsConfirmationText')).toBeInTheDocument();
    
    await user.click(screen.getByText('deleteConfiguration'));
    
    expect(mockOnSchemaChange).toHaveBeenCalledTimes(1);
    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'success',
      kind: 'success',
      isLowContrast: true,
      subtitle: 'tabConfigurationDeleted'
    });
    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockOnSchemaChange).toHaveBeenCalledWith({
      '@openmrs/esm-patient-chart-app': {
        extensionSlots: {
          'patient-chart-dashboard-slot': {
            configure: {
              configKey1: {
                title: 'Sample Title',
                slotName: 'sample-slot',
                isExpanded: true,
                tabDefinitions: [
                  {
                    id: 'tab1',
                    tabName: 'tab1',
                    headerTitle: 'Header 1',
                    displayText: 'Tab 1',
                    encounterType: 'encounter1',
                    columns: [],
                    launchOptions: { displayText: 'Launch' },
                    formList: [],
                  },
                ],
              },
            },
          },
          slot1: {
            configure: {
              configKey1: {
                'encounter-list-table-tabs': undefined,
                slotName: 'slot1',
                title: 'Another Title',
                widgetType1: [{ tabName: 'tab1' }],
              },
            },
          },
        },
      },
    });
  });
});
