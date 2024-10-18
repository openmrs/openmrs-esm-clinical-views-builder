import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import PackageModal from './add-package-modal.component';
import type { Schema } from '../../types';

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

  it('updates key when title changes', () => {
    render(<PackageModal closeModal={closeModal} schema={schema} onSchemaChange={onSchemaChange} />);

    fireEvent.change(screen.getByLabelText('enterClinicalViewTitle'), { target: { value: 'New Title' } });

    expect(mockToCamelCase).toHaveBeenCalledWith('New Title');
  });

  it('shows error when slot name is invalid', () => {
    mockIsValidSlotName.mockReturnValue(false);

    render(<PackageModal closeModal={closeModal} schema={schema} onSchemaChange={onSchemaChange} />);

    fireEvent.change(screen.getByLabelText('enterSlotName'), { target: { value: 'Invalid Slot Name' } });

    expect(screen.getByText('invalidSlotName')).toBeInTheDocument();
  });

  it('calls updatePackages and closeModal on save', () => {
    render(<PackageModal closeModal={closeModal} schema={schema} onSchemaChange={onSchemaChange} />);

    fireEvent.change(screen.getByLabelText('enterClinicalViewTitle'), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByLabelText('enterSlotName'), { target: { value: 'valid-slot-name' } });

    fireEvent.click(screen.getByText('save'));

    expect(onSchemaChange).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'success',
      kind: 'success',
      isLowContrast: true,
      subtitle: 'packageCreated',
    });
  });

  it('shows error snackbar on updatePackages error', () => {
    onSchemaChange.mockImplementation(() => {
      throw new Error('Test error');
    });

    render(<PackageModal closeModal={closeModal} schema={schema} onSchemaChange={onSchemaChange} />);

    fireEvent.change(screen.getByLabelText('enterClinicalViewTitle'), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByLabelText('enterSlotName'), { target: { value: 'valid-slot-name' } });

    fireEvent.click(screen.getByText('save'));

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'errorCreatingPackage',
      kind: 'error',
      subtitle: 'Test error',
    });
  });
});
