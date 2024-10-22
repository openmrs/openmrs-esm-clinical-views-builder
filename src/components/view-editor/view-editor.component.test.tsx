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
  it('renders correctly and allows inputting dummy schema', async () => {
    render(
      <MemoryRouter initialEntries={['/clinical-views-builder/new']}>
        <ContentPackagesEditorContent t={(key) => key} />
      </MemoryRouter>,
    );

    expect(screen.getByText('schemaEditor')).toBeInTheDocument();
    const importSchemaButtons = screen.queryAllByText(/importSchema/i);
    expect(importSchemaButtons.length).toBeGreaterThan(0);
    expect(screen.getByText(/inputDummySchema/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText(/inputDummySchema/i));

    expect(screen.getByText(/interactiveBuilderInfo/i)).toBeInTheDocument();
    expect(screen.getByText(/Package One/i)).toBeInTheDocument();
    expect(screen.getByText(/clinicalViewMenus/i)).toBeInTheDocument();
    expect(screen.getByText(/First Menu/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /First Menu/i }));
    expect(screen.getByText(/menuSlot\s*:\s*first-menu-slot/i)).toBeInTheDocument();
    const firstHelperText = screen.getAllByText(/helperTextForAddDasboards/i)[0];
    expect(firstHelperText).toBeInTheDocument();

    const firstConfigureButton = screen.getAllByRole('button', { name: /configureDashboard/i })[0];
    expect(firstConfigureButton).toBeInTheDocument();
    expect(screen.getByText(/Second Menu/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Second Menu/i }));
    expect(screen.getByText(/menuSlot\s*:\s*second-menu-slot/i)).toBeInTheDocument();
    const secondHelperText = screen.getAllByText(/helperTextForAddDasboards/i)[1];
    expect(secondHelperText).toBeInTheDocument();

    const secondConfigureButton = screen.getAllByRole('button', { name: /configureDashboard/i })[1];
    expect(secondConfigureButton).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /addClinicalViewSubMenu/i })).toBeInTheDocument();
  });
});
