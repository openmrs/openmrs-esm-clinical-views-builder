import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DeleteConfigDetailModal from './delete-config-detail-modal.component';
import { WidgetTypes } from '../../types';
import userEvent from '@testing-library/user-event';

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
});
