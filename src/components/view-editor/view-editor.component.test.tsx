import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ContentPackagesEditorContent } from './view-editor.component';
import userEvent from '@testing-library/user-event';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

beforeEach(() => {
  localStorage.clear();
});

describe('ContentPackagesEditorContent', () => {
  const mockShowSnackbar = jest.fn();
  const defaultExistingContent = {
    '@openmrs/esm-patient-chart-app': {
      extensionSlots: {
        'patient-chart-dashboard-slot': {
          configure: {
            'hiv-summary-dashboard-slot': {
              title: 'HIV Summary',
              launchOptions: { displayText: 'add' },
              formList: [{ uuid: '8c48efc5-dd85-3795-9f58-8eb436a4edcc' }],
            },
          },
        },
      },
    },
  };

  const renderComponent = (path: string, clinicalViewId?: string) => {
    if (clinicalViewId) {
      localStorage.setItem(clinicalViewId, JSON.stringify(defaultExistingContent));
    }

    return render(
      <MemoryRouter initialEntries={[path]}>
        <ContentPackagesEditorContent t={(key) => key} />
      </MemoryRouter>,
    );
  };

  const verifyBasicElements = async () => {
    expect(screen.getByText('schemaEditor')).toBeInTheDocument();
    expect(screen.getByText(/interactiveBuilderHelperText/i)).toBeInTheDocument();

    const startBuildingButton = screen.getByRole('button', { name: /startBuilding/i });
    expect(startBuildingButton).toBeInTheDocument();
    await userEvent.click(startBuildingButton);
    expect(screen.getByText(/clinicalViewMenus/i)).toBeInTheDocument();
  };

  beforeEach(() => {
    localStorage.clear();
    jest.mock('@openmrs/esm-framework', () => ({
      showSnackbar: mockShowSnackbar,
      useConfig: () => ({}),
    }));
  });

  it('renders correctly and allows inputting dummy schema', async () => {
    renderComponent('/clinical-views-builder/new');

    expect(screen.getByText('schemaEditor')).toBeInTheDocument();
    const importSchemaButtons = screen.queryAllByText(/importSchema/i);
    expect(importSchemaButtons.length).toBeGreaterThan(0);

    await userEvent.click(screen.getByText(/inputDummySchema/i));

    ['Package One', 'First Menu', 'Second Menu'].forEach((text) =>
      expect(screen.getByText(new RegExp(text, 'i'))).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole('button', { name: /First Menu/i }));
    expect(screen.getByText(/menuSlot\s*:\s*first-menu-slot/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Second Menu/i }));
    expect(screen.getByText(/menuSlot\s*:\s*second-menu-slot/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /addClinicalViewSubMenu/i })).toBeInTheDocument();
  });

  it('should render the view editor with existing content', async () => {
    const clinicalViewId = 'existing-clinical-view-id';
    renderComponent(`/clinical-views-builder/edit/${clinicalViewId}`, clinicalViewId);
    await verifyBasicElements();
  });

  it('should allow editing view content through the interactive builder', async () => {
    const clinicalViewId = 'existing-clinical-view-id';
    renderComponent(`/clinical-views-builder/edit/${clinicalViewId}`, clinicalViewId);
    await verifyBasicElements();

    const editTabDefinitionButton = screen.getByRole('button', { name: /renderChanges/i });
    expect(editTabDefinitionButton).toBeInTheDocument();
    await userEvent.click(editTabDefinitionButton);
    const formInput = screen.getByRole('textbox');
    expect(formInput).toBeInTheDocument();
    await userEvent.type(formInput, 'New Form Input Value');
  });

  it('should handle errors during schema operations', async () => {
    const clinicalViewId = 'existing-clinical-view-id';
    renderComponent(`/clinical-views-builder/edit/${clinicalViewId}`, clinicalViewId);
    await verifyBasicElements();

    const saveSchemaButton = screen.getByRole('button', { name: /saveClinicalView/i });
    expect(saveSchemaButton).toBeInTheDocument();
    await userEvent.click(saveSchemaButton);
  });

  it('should allow editing form configurations within menus', async () => {
    const clinicalViewId = 'existing-clinical-view-id';
    renderComponent(`/clinical-views-builder/edit/${clinicalViewId}`, clinicalViewId);
    await verifyBasicElements();

    const editTabDefinitionButton = screen.getByRole('button', { name: /renderChanges/i });
    expect(editTabDefinitionButton).toBeInTheDocument();
    await userEvent.click(editTabDefinitionButton);
    const formInput = screen.getByRole('textbox');
    expect(formInput).toBeInTheDocument();
    await userEvent.type(formInput, 'New Form Input Value');
  });

  it('should properly update state when schema changes', async () => {
    const clinicalViewId = 'existing-clinical-view-id';
    renderComponent(`/clinical-views-builder/edit/${clinicalViewId}`, clinicalViewId);
    await verifyBasicElements();

    const schemaInput = screen.getByRole('textbox');
    expect(schemaInput).toBeInTheDocument();
    await userEvent.type(schemaInput, 'Updated Schema');
    const saveButton = screen.getByRole('button', { name: /saveClinicalView/i });
    await userEvent.click(saveButton);
    const updatedSchemaInput = screen.getByRole('textbox');
    expect(updatedSchemaInput).toBeInTheDocument();
  });
});
