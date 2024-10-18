import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { showModal, showSnackbar } from '@openmrs/esm-framework';
import InteractiveBuilder from './interactive-builder.component';
import { v4 as uuidv4 } from 'uuid';
import { type Schema } from '../../types';

jest.mock('@openmrs/esm-framework', () => ({
  showModal: jest.fn(),
  showSnackbar: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('InteractiveBuilder', () => {
  const mockOnSchemaChange = jest.fn();
  const mockSchema: Schema = {
    id: uuidv4(),
    '@openmrs/esm-patient-chart-app': {
      extensionSlots: {
        'patient-chart-dashboard-slot': {
          add: ['navGroup1'], // This ensures that submenus are added
          configure: {
            navGroup1: {
              title: 'Sample Clinical View',
              slotName: 'sample-slot',
              tabDefinitions: [
                {
                  id: 'tab1',
                  tabName: 'Tab 1',
                  headerTitle: 'Header 1',
                  displayText: 'Tab 1 Display Text',
                  encounterType: 'encounter-type-1',
                  columns: [
                    {
                      id: 'col1',
                      title: 'Column 1',
                      concept: 'Concept 1',
                      isDate: false,
                      isLink: false,
                    },
                  ],
                  launchOptions: { displayText: 'Launch' },
                  formList: [],
                },
              ],
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders interactive builder with initial state and start button', () => {
    render(<InteractiveBuilder schema={null} onSchemaChange={mockOnSchemaChange} />);

    // Check that the explainer text and start button are rendered
    expect(screen.getByText(/interactive builder/i)).toBeInTheDocument();
    expect(screen.getByText(/start building/i)).toBeInTheDocument();
  });

  it('opens the "Add Clinical View" modal when start button is clicked', () => {
    render(<InteractiveBuilder schema={null} onSchemaChange={mockOnSchemaChange} />);

    // Simulate click on start button
    fireEvent.click(screen.getByText(/start building/i));

    // Expect showModal to be called with correct arguments
    expect(showModal).toHaveBeenCalledWith(
      'new-package-modal',
      expect.objectContaining({
        onSchemaChange: mockOnSchemaChange,
      }),
    );
  });

  it('opens the "Add Submenu" modal when "Add Submenu" button is clicked', () => {
    render(<InteractiveBuilder schema={mockSchema} onSchemaChange={mockOnSchemaChange} />);

    // Simulate click on "Add Submenu" button
    fireEvent.click(screen.getByText(/add clinical view submenu/i));

    // Expect showModal to be called with correct arguments
    expect(showModal).toHaveBeenCalledWith(
      'new-menu-modal',
      expect.objectContaining({
        schema: mockSchema,
        onSchemaChange: mockOnSchemaChange,
      }),
    );
  });
});
