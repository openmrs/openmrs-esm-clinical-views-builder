import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import NewSubMenuModal from './add-submenu-modal.component';
import { type Schema } from '../../types';
import userEvent from '@testing-library/user-event';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.Mock;
const mockShowSnackbar = showSnackbar as jest.Mock;

describe('NewSubMenuModal', () => {
  const schema: Schema = {
    '@openmrs/esm-patient-chart-app': {
      extensionSlots: {
        'patient-chart-dashboard-slot': {
          add: [],
          configure: {
            'nav-group#example': {
              slotName: 'example-slot',
              title: 'Example Title',
            },
          },
        },
      },
    },
  };

  const onSchemaChange = jest.fn();
  const closeModal = jest.fn();

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with input fields', () => {
    render(<NewSubMenuModal schema={schema} onSchemaChange={onSchemaChange} closeModal={closeModal} />);

    expect(screen.getByLabelText('programIdentifier')).toBeInTheDocument();
    expect(screen.getByLabelText('menuName')).toBeInTheDocument();
  });

  it('displays an error snackbar if slot name is not found', async () => {
    const schemaWithoutSlot = {
      '@openmrs/esm-patient-chart-app': {
        extensionSlots: {
          'patient-chart-dashboard-slot': {
            add: [],
            configure: {},
          },
        },
      },
    };

    render(<NewSubMenuModal schema={schemaWithoutSlot} onSchemaChange={onSchemaChange} closeModal={closeModal} />);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'errorFindingSlotName',
        kind: 'error',
        subtitle: 'slotNameNotFound',
      });
    });
  });

  it('updates schema and shows success snackbar on valid input', async () => {
    const user = userEvent.setup();
    render(<NewSubMenuModal schema={schema} onSchemaChange={onSchemaChange} closeModal={closeModal} />);

    await user.type(screen.getByLabelText('programIdentifier'), 'Hiv Care and Treatment');
    await user.type(screen.getByLabelText('menuName'), 'Patient Summary');
    await user.click(screen.getByText('createSubMenu'));

    await waitFor(() => {
      expect(onSchemaChange).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'success',
        kind: 'success',
        isLowContrast: true,
        subtitle: 'submenuCreated',
      });
      expect(closeModal).toHaveBeenCalled();
    });
  });

  it('disables create button if inputs are empty', () => {
    render(<NewSubMenuModal schema={schema} onSchemaChange={onSchemaChange} closeModal={closeModal} />);

    const createButton = screen.getByRole('button', { name: 'createSubMenu' });

    expect(createButton).toBeDisabled();
  });
});
