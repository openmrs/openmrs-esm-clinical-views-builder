import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import PackageModal from './add-package-modal.component';
import type { Schema } from '../../types';
import userEvent from '@testing-library/user-event';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
}));

jest.mock('../../helpers', () => ({
  isValidSlotName: jest.fn(),
  toCamelCase: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.Mock;
const mockShowSnackbar = showSnackbar as jest.Mock;
const mockIsValidSlotName = require('../../helpers').isValidSlotName as jest.Mock;
const mockToCamelCase = require('../../helpers').toCamelCase as jest.Mock;

describe('PackageModal', () => {
  const closeModal = jest.fn();
  const onSchemaChange = jest.fn();
  const schema: Schema = {
    '@openmrs/esm-patient-chart-app': {
      extensionSlots: {
        'patient-chart-dashboard-slot': {
          add: [],
          configure: {},
        },
      },
    },
  };

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({ t: (key: string) => key });
    mockIsValidSlotName.mockReturnValue(true);
    mockToCamelCase.mockReturnValue('camelCaseTitle');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with initial state', () => {
    render(<PackageModal closeModal={closeModal} schema={schema} onSchemaChange={onSchemaChange} />);

    expect(screen.getByLabelText('enterClinicalViewTitle')).toBeInTheDocument();
    expect(screen.getByLabelText('enterSlotName')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
    expect(screen.getByText('save')).toBeInTheDocument();
  });

  it('updates key when title changes', async () => {
    const user = userEvent.setup();
    render(<PackageModal closeModal={closeModal} schema={schema} onSchemaChange={onSchemaChange} />);

    await user.type(screen.getByLabelText('enterClinicalViewTitle'), 'New Title');

    expect(mockToCamelCase).toHaveBeenCalledWith('New Title');
  });

  it('shows error when slot name is invalid', async () => {
    mockIsValidSlotName.mockReturnValue(false);
    const user = userEvent.setup();

    render(<PackageModal closeModal={closeModal} schema={schema} onSchemaChange={onSchemaChange} />);

    await user.type(screen.getByLabelText('enterSlotName'), 'Invalid Slot Name');

    expect(screen.getByText('invalidSlotName')).toBeInTheDocument();
  });

  it('calls updatePackages and closeModal on save', async () => {
    const user = userEvent.setup();
    render(<PackageModal closeModal={closeModal} schema={schema} onSchemaChange={onSchemaChange} />);

    await user.type(screen.getByLabelText('enterClinicalViewTitle'), 'New Title');
    await user.type(screen.getByLabelText('enterSlotName'), 'valid-slot-name');

    await user.click(screen.getByText('save'));

    expect(onSchemaChange).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'success',
      kind: 'success',
      isLowContrast: true,
      subtitle: 'packageCreated',
    });
  });

  it('shows error snackbar on updatePackages error', async () => {
    const user = userEvent.setup();
    onSchemaChange.mockImplementation(() => {
      throw new Error('Test error');
    });

    render(<PackageModal closeModal={closeModal} schema={schema} onSchemaChange={onSchemaChange} />);

    await user.type(screen.getByLabelText('enterClinicalViewTitle'), 'New Title');
    await user.type(screen.getByLabelText('enterSlotName'), 'valid-slot-name');

    await user.click(screen.getByText('save'));

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'errorCreatingPackage',
      kind: 'error',
      subtitle: 'Test error',
    });
  });
});
