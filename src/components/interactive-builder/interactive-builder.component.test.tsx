import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { showModal, showSnackbar } from '@openmrs/esm-framework';
import InteractiveBuilder from './interactive-builder.component';
import { v4 as uuidv4 } from 'uuid';
import { type Schema } from '../../types';
import userEvent from '@testing-library/user-event';

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
          add: ['navGroup1'],
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

  const mockConfigureTabsSchema: Schema = {
    id: 'e0fa849d-34b9-4f09-8f53-b669df28efaa',
    '@openmrs/esm-patient-chart-app': {
      extensionSlots: {
        'patient-chart-dashboard-slot': {
          add: ['nav-group#hIVPackage'],
          configure: {
            'nav-group#hIVPackage': {
              title: 'HIV Package',
              slotName: 'hiv-package',
              isExpanded: true,
            },
          },
        },
        'hiv-package': {
          add: ['dashboard#hcat-patient-summary'],
          configure: {
            'dashboard#hcat-patient-summary': {
              title: 'Patient Summary',
              path: 'hcat-patient-summary',
              slot: 'hcat-patient-summary-dashboard-slot',
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

    expect(screen.getByText(/interactive builder/i)).toBeInTheDocument();
    expect(screen.getByText(/start building/i)).toBeInTheDocument();
  });

  it('opens the "Add Clinical View" modal when start button is clicked', async () => {
    const user = userEvent.setup();
    render(<InteractiveBuilder schema={null} onSchemaChange={mockOnSchemaChange} />);

    await user.click(screen.getByText(/start building/i));

    expect(showModal).toHaveBeenCalledWith(
      'new-package-modal',
      expect.objectContaining({
        onSchemaChange: mockOnSchemaChange,
      }),
    );
  });

  it('opens the "Add Submenu" modal when "Add Submenu" button is clicked', async () => {
    const user = userEvent.setup();
    render(<InteractiveBuilder schema={mockSchema} onSchemaChange={mockOnSchemaChange} />);

    await user.click(screen.getByText(/add clinical view submenu/i));

    expect(showModal).toHaveBeenCalledWith(
      'new-menu-modal',
      expect.objectContaining({
        schema: mockSchema,
        onSchemaChange: mockOnSchemaChange,
      }),
    );
  });

  it('enables a user to configure encounter table tabs', async () => {
    const user = userEvent.setup();
    render(<InteractiveBuilder schema={mockConfigureTabsSchema} onSchemaChange={mockOnSchemaChange} />);

    expect(screen.getByText(/Continue adding sub menus and configuring dashboards/i)).toBeInTheDocument();
    expect(screen.getByText(/HIV Package/i)).toBeInTheDocument;
    expect(screen.getByText(/Clinical View Submenus/i)).toBeInTheDocument;
    const accordionButton = screen.getByRole('button', { name: /patient summary/i }); // Adjust based on the accordion's button text
    await user.click(accordionButton);
    expect(screen.getByText(/Menu Slot : hcat-patient-summary-dashboard-slot/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Now configure dashboards to show on the patient chart when this submenu is clicked/i),
    ).toBeInTheDocument();
    const configureDashboardButton = screen.getByRole('button', { name: /configure dashboard/i });
    expect(configureDashboardButton).toBeInTheDocument();

    await user.click(configureDashboardButton);

    expect(showModal).toHaveBeenCalledWith(
      'configure-dashboard-modal',
      expect.objectContaining({
        closeModal: expect.any(Function),
        onSchemaChange: expect.any(Function),
        schema: {
          '@openmrs/esm-patient-chart-app': {
            extensionSlots: {
              'hiv-package': {
                add: ['dashboard#hcat-patient-summary'],
                configure: {
                  'dashboard#hcat-patient-summary': {
                    path: 'hcat-patient-summary',
                    slot: 'hcat-patient-summary-dashboard-slot',
                    title: 'Patient Summary',
                  },
                },
              },
              'patient-chart-dashboard-slot': {
                add: ['nav-group#hIVPackage'],
                configure: {
                  'nav-group#hIVPackage': { isExpanded: true, slotName: 'hiv-package', title: 'HIV Package' },
                },
              },
            },
          },
          id: 'e0fa849d-34b9-4f09-8f53-b669df28efaa',
        },
        slotName: 'hcat-patient-summary-dashboard-slot',
      }),
    );
  });
});
