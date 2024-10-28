import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentPackagesBuilderPagination } from './pagination.component';
import { useLayoutType } from '@openmrs/esm-framework';
import { usePaginationInfo } from './usePaginationInfo';
import { Pagination } from '@carbon/react';

jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: jest.fn(),
}));

jest.mock('./usePaginationInfo', () => ({
  usePaginationInfo: jest.fn(),
}));

jest.mock('@carbon/react', () => ({
  Pagination: jest.fn((props) => (
    <div role="navigation" aria-label="Pagination" data-testid="mock-pagination">
      <button
        onClick={() => props.onChange({ page: props.page + 1, pageSize: props.pageSize })}
        aria-label="Next page"
        type="button"
      >
        Next
      </button>
      <select
        data-testid="page-size-select"
        value={props.pageSize}
        onChange={(e) => props.onChange({ page: 1, pageSize: Number(e.target.value) })}
        aria-label="Items per page"
      >
        {props.pageSizes.map((size) => (
          <option key={size} value={size}>
            {size} items per page
          </option>
        ))}
      </select>
      <input
        type="number"
        data-testid="page-input"
        value={props.page}
        onChange={(e) => {
          const newPage = Number(e.target.value);
          if (newPage > 0 && newPage <= Math.ceil(props.totalItems / props.pageSize)) {
            props.onChange({ page: newPage, pageSize: props.pageSize });
          }
        }}
        aria-label="Current page number"
        min={1}
        max={Math.ceil(props.totalItems / props.pageSize)}
      />
    </div>
  )),
}));

jest.mock('./pagination.scss', () => ({
  tablet: 'tablet-class',
  desktop: 'desktop-class',
  pagination: 'pagination-class',
}));

describe('ContentPackagesBuilderPagination', () => {
  const mockLayoutType = useLayoutType as jest.Mock;
  const mockPaginationInfo = usePaginationInfo as jest.Mock;

  const defaultProps = {
    currentItems: 10,
    totalItems: 100,
    pageNumber: 1,
    pageSize: 10,
    onPageNumberChange: jest.fn(),
  };

  beforeEach(() => {
    mockLayoutType.mockReset();
    mockPaginationInfo.mockReset();
    mockLayoutType.mockReturnValue('desktop');
    mockPaginationInfo.mockReturnValue({
      itemsDisplayed: '1-10 of 100 items',
      pageSizes: [10, 20, 30, 40, 50],
    });
  });

  it('renders no content when there are no items', () => {
    render(<ContentPackagesBuilderPagination {...defaultProps} totalItems={0} />);
    const pagination = screen.queryByRole('navigation');
    expect(pagination).not.toBeInTheDocument();
  });

  it('displays the correct items text', () => {
    render(<ContentPackagesBuilderPagination {...defaultProps} />);
    const itemsText = screen.getByText('1-10 of 100 items');
    expect(itemsText).toBeInTheDocument();
  });

  it('applies desktop styles when on desktop layout', () => {
    mockLayoutType.mockReturnValue('desktop');
    render(<ContentPackagesBuilderPagination {...defaultProps} />);
    const paginationWrapper = screen.getByTestId('mock-pagination').parentElement;
    expect(paginationWrapper).toHaveClass('desktop-class');
  });

  it('applies tablet styles when on tablet layout', () => {
    mockLayoutType.mockReturnValue('tablet');
    render(<ContentPackagesBuilderPagination {...defaultProps} />);
    const paginationWrapper = screen.getByTestId('mock-pagination').parentElement;
    expect(paginationWrapper).toHaveClass('tablet-class');
  });

  it('handles next page navigation', async () => {
    const user = userEvent.setup();
    const onPageNumberChange = jest.fn();

    render(<ContentPackagesBuilderPagination {...defaultProps} onPageNumberChange={onPageNumberChange} />);

    const nextButton = screen.getByRole('button', { name: /next page/i });
    await user.click(nextButton);

    expect(onPageNumberChange).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
  });

  it('handles page size changes', async () => {
    const user = userEvent.setup();
    const onPageNumberChange = jest.fn();

    render(<ContentPackagesBuilderPagination {...defaultProps} onPageNumberChange={onPageNumberChange} />);

    const pageSizeSelect = screen.getByRole('combobox', { name: /items per page/i });
    await user.selectOptions(pageSizeSelect, '20');

    expect(onPageNumberChange).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });

  it('passes correct props to Pagination component', () => {
    render(<ContentPackagesBuilderPagination {...defaultProps} />);

    const pagination = screen.getByTestId('mock-pagination');
    expect(pagination).toBeInTheDocument();

    expect(Pagination).toHaveBeenCalledWith(
      expect.objectContaining({
        page: defaultProps.pageNumber,
        pageSize: defaultProps.pageSize,
        totalItems: defaultProps.totalItems,
        pageSizes: [10, 20, 30, 40, 50],
        onChange: expect.any(Function),
        size: 'sm',
      }),
      expect.any(Object),
    );
  });

  it('works without onPageNumberChange callback', () => {
    const { rerender } = render(
      <ContentPackagesBuilderPagination {...defaultProps} onPageNumberChange={undefined} />
    );

    expect(() => {
      rerender(<ContentPackagesBuilderPagination {...defaultProps} onPageNumberChange={undefined} />);
    }).not.toThrow();
  });
});