import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DeleteConfigDetailModal from './delete-config-detail-modal.component';
import { showSnackbar } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { WidgetTypes } from '../../types';

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
              title: 'Sample Title', // Required property
              slotName: 'sample-slot', // Required property
              isExpanded: true, // Optional
              tabDefinitions: [
                {
                  id: 'tab1', // Add id property here
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
              title: 'Another Title', // Add required title here
              slotName: 'slot1', // Add required slotName here
              widgetType1: [{ tabName: 'tab1' }],
            },
          },
        },
      },
    },
  },
  onSchemaChange: mockOnSchemaChange,
  slotDetails: {
    title: 'Sample Slot Title', // Required by DashboardConfig
    path: 'sample/slot/path', // Required by DashboardConfig
    slot: 'slot1', // Slot identifier
  },
  tabDefinition: {
    id: 'tab1', // Add required id
    tabName: 'tab1',
    headerTitle: 'Header 1',
    displayText: 'Tab 1', // Add required displayText
    encounterType: 'encounter1', // Add required encounterType
    columns: [], // Add required columns
    launchOptions: { displayText: 'Launch' }, // Add required launchOptions
    formList: [], // Add required formList
  },
  configurationKey: 'configKey1',
  widgetType: WidgetTypes.ENCOUNTER_LIST_TABLE_TABS, // Updated to match WidgetTypes
};

describe('DeleteConfigDetailModal', () => {
  it('renders the modal with correct text', () => {
    render(<DeleteConfigDetailModal {...mockProps} />);

    expect(screen.getByText('deleteConfigDetailsConfirmationText')).toBeInTheDocument();
    expect(screen.getByText('menuSlot : slot1')).toBeInTheDocument();
    expect(screen.getByText('tabName : tab1')).toBeInTheDocument();
    expect(screen.getByText('headerTitle : Header 1')).toBeInTheDocument();
  });

  it('calls closeModal when cancel button is clicked', () => {
    render(<DeleteConfigDetailModal {...mockProps} />);

    fireEvent.click(screen.getByText('cancel'));
    expect(mockCloseModal).toHaveBeenCalled();
  });
});
