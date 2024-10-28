import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentPackagesList } from './dashboard.component';
import { getAllPackagesFromLocalStorage } from '../../utils';
import { mockContentPackages } from '../../../__mocks__/content-packages.mock';
import userEvent from '@testing-library/user-event';

jest.mock('../../utils', () => ({
  getAllPackagesFromLocalStorage: jest.fn(),
}));

const mockSetClinicalViews = jest.fn();

describe('DashboardComponent', () => {
  beforeEach(() => {
    (getAllPackagesFromLocalStorage as jest.Mock).mockReturnValue(mockContentPackages);
  });

  it('renders the empty Dashboard component if there no clinical views', async () => {
    render(<ContentPackagesList t={(key) => key} clinicalViews={[]} setClinicalViews={mockSetClinicalViews} />);
    expect(screen.getByText('clinicalViewsTableHeader')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Filter table')).toBeInTheDocument();
    });
    expect(screen.getByText('noMatchingClinicalViewsToDisplay')).toBeInTheDocument();
    expect(screen.getByText('checkFilters')).toBeInTheDocument();
  });

  it('renders the clinical views if they exisit in the Dashboard component', async () => {
    render(
      <ContentPackagesList
        t={(key) => key}
        clinicalViews={mockContentPackages}
        setClinicalViews={mockSetClinicalViews}
      />,
    );

    expect(screen.getByText('clinicalViewsTableHeader'));
    await waitFor(() => {
      expect(screen.getByText('Filter table')).toBeInTheDocument();
    });

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /dashboards/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /schemaActions/i })).toBeInTheDocument();

    expect(screen.getByRole('row', { name: /hIVCareAndTreatment/i })).toBeInTheDocument();
    expect(
      screen.getByRole('row', {
        name: /patientSummary, programManagement, clinicalVisits, generalCounselling, partnerNotification/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editSchema/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /downloadSchema/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deleteSchema/i })).toBeInTheDocument();
  });

  it('handles search input', async () => {
    render(
      <ContentPackagesList
        t={(key) => key}
        clinicalViews={mockContentPackages}
        setClinicalViews={mockSetClinicalViews}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('clinicalViewsTableHeader'));
    });

    const searchInput = screen.getByLabelText('Filter table');
    await userEvent.type(searchInput, 'Clinical View 1');
    expect(searchInput).toHaveValue('Clinical View 1');
  });
});
