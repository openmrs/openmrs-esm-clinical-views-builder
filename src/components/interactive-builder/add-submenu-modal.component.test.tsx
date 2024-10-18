import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import NewSubMenuModal from './add-submenu-modal.component';
import { type Schema } from '../../types';

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
              title: 'Example Title', // Add the missing title property here
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
          }, // Add 'patient-chart-dashboard-slot' here, even if it's empty
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
    render(<NewSubMenuModal schema={schema} onSchemaChange={onSchemaChange} closeModal={closeModal} />);

    fireEvent.change(screen.getByLabelText('programIdentifier'), { target: { value: 'Hiv Care and Treatment' } });
    fireEvent.change(screen.getByLabelText('menuName'), { target: { value: 'Patient Summary' } });

    fireEvent.click(screen.getByText('createSubMenu'));

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

    // Find the button by its role instead of using getByText
    const createButton = screen.getByRole('button', { name: 'createSubMenu' });

    expect(createButton).toBeDisabled(); // This should now work as you're targeting the actual button
  });
});
