import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ConfigureDashboardModal from './configure-dashboard-modal.component';
import { showSnackbar } from '@openmrs/esm-framework';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
}));

const mockSchema = {
  '@openmrs/esm-patient-chart-app': {
    extensionSlots: {
      'patient-chart-dashboard-slot': {
        add: [],
        configure: {},
      },
    },
  },
};

const mockOnSchemaChange = jest.fn();
const mockCloseModal = jest.fn();

describe('ConfigureDashboardModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with initial state', () => {
    render(
      <ConfigureDashboardModal
        schema={mockSchema}
        onSchemaChange={mockOnSchemaChange}
        closeModal={mockCloseModal}
        slotName="test-slot"
      />,
    );

    expect(screen.getByLabelText('slotName')).toHaveValue('test-slot');
    expect(screen.getByLabelText('selectWidget')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /createSubMenu/i })).toBeDisabled();
  });

  it('enables the create button when a widget is selected', async () => {
    render(
      <ConfigureDashboardModal
        schema={mockSchema}
        onSchemaChange={mockOnSchemaChange}
        closeModal={mockCloseModal}
        slotName="test-slot"
      />,
    );

    const selectWidget = screen.getByLabelText('selectWidget');
    await userEvent.selectOptions(selectWidget, 'encounter-list-table-tabs');

    expect(screen.getByText('createSubMenu')).toBeEnabled();
  });

  it('calls onSchemaChange and closeModal when create button is clicked', async () => {
    render(
      <ConfigureDashboardModal
        schema={mockSchema}
        onSchemaChange={mockOnSchemaChange}
        closeModal={mockCloseModal}
        slotName="test-slot"
      />,
    );

    await userEvent.selectOptions(screen.getByLabelText('selectWidget'), 'encounter-list-table-tabs');
    await userEvent.type(screen.getByLabelText('tabName'), 'Test Tab');
    await userEvent.type(screen.getByLabelText('displayTitle'), 'Test Display Title');

    await userEvent.click(screen.getByText('createSubMenu'));

    expect(mockOnSchemaChange).toHaveBeenCalled();
    expect(mockCloseModal).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'success',
      kind: 'success',
      isLowContrast: true,
      subtitle: 'submenuCreated',
    });
  });

  it('shows error snackbar when updateSchema throws an error', async () => {
    const faultySchema = {
      ...mockSchema,
      '@openmrs/esm-patient-chart-app': null,
    };

    render(
      <ConfigureDashboardModal
        schema={faultySchema}
        onSchemaChange={mockOnSchemaChange}
        closeModal={mockCloseModal}
        slotName="test-slot"
      />,
    );

    await userEvent.selectOptions(screen.getByLabelText('selectWidget'), 'encounter-list-table-tabs');
    await userEvent.type(screen.getByLabelText('tabName'), 'Test Tab');
    await userEvent.type(screen.getByLabelText('displayTitle'), 'Test Display Title');

    await userEvent.click(screen.getByText('createSubMenu'));

    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'errorCreatingSubmenu',
      kind: 'error',
      subtitle: expect.any(String),
    });
  });
});
