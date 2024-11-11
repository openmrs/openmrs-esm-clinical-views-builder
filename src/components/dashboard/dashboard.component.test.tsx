import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentPackagesList } from './dashboard.component';
import { getAllPackagesFromLocalStorage } from '../../utils';
import { mockContentPackages } from '../../../__mocks__/content-packages.mock';
import userEvent from '@testing-library/user-event';

jest.mock('../../utils', () => ({
  getAllPackagesFromLocalStorage: jest.fn(),
  deletePackageFromLocalStorage: jest.fn(),
}));

const mockSetClinicalViews = jest.fn();

describe('DashboardComponent', () => {
  const setupMocks = () => {
    const mocks = {
      setClinicalViews: jest.fn(),
      consoleSpy: jest.spyOn(console, 'error').mockImplementation(() => {}),
      localStorageGetItem: jest.fn(),
      mockUrl: 'blob:mock-url',
      mockAnchor: document.createElement('a'),
      mockClick: jest.fn(),
      originalCreateObjectURL: URL.createObjectURL,
      originalRevokeObjectURL: URL.revokeObjectURL,
      originalCreateElement: document.createElement.bind(document),
    };

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mocks.localStorageGetItem,
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Setup URL mocks
    URL.createObjectURL = jest.fn(() => mocks.mockUrl);
    URL.revokeObjectURL = jest.fn();

    // Setup anchor element mock
    Object.defineProperties(mocks.mockAnchor, {
      click: { value: mocks.mockClick, writable: true },
      href: { value: '', writable: true },
      download: { value: '', writable: true },
    });

    // Setup document.createElement mock
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        return mocks.mockAnchor;
      }
      return mocks.originalCreateElement(tag);
    });

    return mocks;
  };

  const cleanupMocks = (mocks: ReturnType<typeof setupMocks>) => {
    URL.createObjectURL = mocks.originalCreateObjectURL;
    URL.revokeObjectURL = mocks.originalRevokeObjectURL;
    document.createElement = mocks.originalCreateElement;
    mocks.consoleSpy.mockRestore();
  };

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

  it('downloads the schema when the download button is clicked', async () => {
    const mocks = setupMocks();

    mocks.localStorageGetItem.mockImplementation(() => mockContentPackages[0]);

    render(
      <ContentPackagesList
        t={(key) => key}
        clinicalViews={mockContentPackages}
        setClinicalViews={mocks.setClinicalViews}
      />,
    );

    const downloadButton = await screen.findByRole('button', {
      name: /downloadSchema/i,
    });

    await userEvent.click(downloadButton);

    expect(mocks.localStorageGetItem).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mocks.mockClick).toHaveBeenCalled();

    mocks.localStorageGetItem.mockReset();
    mocks.mockClick.mockReset();
    mocks.consoleSpy.mockReset();

    mocks.localStorageGetItem.mockReturnValue(null);

    await userEvent.click(downloadButton);
    const blobCall = (URL.createObjectURL as jest.Mock).mock.calls[0][0];
    expect(blobCall).toBeInstanceOf(Blob);
    expect(blobCall.type).toBe('application/json;charset=utf-8');

    expect(mocks.mockAnchor.href).toBe('blob:mock-url');
    cleanupMocks(mocks);
  });
});
