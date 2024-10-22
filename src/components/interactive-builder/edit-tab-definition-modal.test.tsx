import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditTabDefinitionModal from './edit-tab-definition-modal';
import userEvent from '@testing-library/user-event';

describe('EditTabDefinitionModal', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const tabDefinition = { tabName: 'Initial Tab', headerTitle: 'Initial Header' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial values', () => {
    const { getByLabelText } = render(
      <EditTabDefinitionModal tabDefinition={tabDefinition} onSave={mockOnSave} onCancel={mockOnCancel} />,
    );

    expect(getByLabelText('Tab Name')).toHaveValue('Initial Tab');
    expect(getByLabelText('Header Title')).toHaveValue('Initial Header');
  });

  it('calls onSave with updated values', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByText } = render(
      <EditTabDefinitionModal tabDefinition={tabDefinition} onSave={mockOnSave} onCancel={mockOnCancel} />,
    );

    await user.clear(getByLabelText('Tab Name'));
    await user.type(getByLabelText('Tab Name'), 'Updated Tab');

    await user.clear(getByLabelText('Header Title'));
    await user.type(getByLabelText('Header Title'), 'Updated Header');

    await user.click(getByText('Save'));

    expect(mockOnSave).toHaveBeenCalledWith({
      ...tabDefinition,
      tabName: 'Updated Tab',
      headerTitle: 'Updated Header',
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <EditTabDefinitionModal tabDefinition={tabDefinition} onSave={mockOnSave} onCancel={mockOnCancel} />,
    );

    await user.click(getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
