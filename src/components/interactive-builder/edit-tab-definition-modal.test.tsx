import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import EditTabDefinitionModal from './edit-tab-definition-modal';

const renderWithI18n = (ui) => {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
};

describe('EditTabDefinitionModal', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const tabDefinition = { tabName: 'Initial Tab', headerTitle: 'Initial Header' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial values', () => {
    const { getByLabelText } = renderWithI18n(
      <EditTabDefinitionModal tabDefinition={tabDefinition} onSave={mockOnSave} onCancel={mockOnCancel} />,
    );

    expect(getByLabelText('Tab Name')).toHaveValue('Initial Tab');
    expect(getByLabelText('Header Title')).toHaveValue('Initial Header');
  });

  it('calls onSave with updated values', () => {
    const { getByLabelText, getByText } = renderWithI18n(
      <EditTabDefinitionModal tabDefinition={tabDefinition} onSave={mockOnSave} onCancel={mockOnCancel} />,
    );

    fireEvent.change(getByLabelText('Tab Name'), { target: { value: 'Updated Tab' } });
    fireEvent.change(getByLabelText('Header Title'), { target: { value: 'Updated Header' } });

    fireEvent.click(getByText('Save'));

    expect(mockOnSave).toHaveBeenCalledWith({
      ...tabDefinition,
      tabName: 'Updated Tab',
      headerTitle: 'Updated Header',
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const { getByText } = renderWithI18n(
      <EditTabDefinitionModal tabDefinition={tabDefinition} onSave={mockOnSave} onCancel={mockOnCancel} />,
    );

    fireEvent.click(getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
