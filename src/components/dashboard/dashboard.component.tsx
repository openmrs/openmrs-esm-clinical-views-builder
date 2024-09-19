import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import {
  Button,
  DataTable,
  IconButton,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { Add, Download, Edit, TrashCan } from '@carbon/react/icons';
import { type KeyedMutator } from 'swr';
import { ContentPackagesBuilderPagination } from '../pagination';

import Header from '../header/header.component';
import styles from './dashboard.scss';
import { mockContentPackages } from '../../../__mocks__/content-packages.mock';
import { navigate, useLayoutType, usePagination } from '@openmrs/esm-framework';

type Mutator = KeyedMutator<{
  data: {
    results: Array<any>;
  };
}>;

interface ActionButtonsProps {
  clinicalViews: any;
  mutate: Mutator;
  responsiveSize: string;
  t: TFunction;
}

function ActionButtons({ clinicalViews, mutate, responsiveSize, t }: ActionButtonsProps) {
  const defaultEnterDelayInMs = 300;

  const launchDeleteClinicalViewsPackageModal = {};

  const EditButton = () => {
    return (
      <IconButton
        enterDelayMs={defaultEnterDelayInMs}
        kind="ghost"
        label={t('editSchema', 'Edit schema')}
        onClick={() =>
          navigate({
            to: `${window.spaBase}/clinical-views-builder/edit/${clinicalViews}`,
          })
        }
        size={responsiveSize}
      >
        <Edit />
      </IconButton>
    );
  };

  const DownloadSchemaButton = () => {
    return (
      <a download={`${clinicalViews}.json`} href="#">
        <IconButton
          enterDelayMs={defaultEnterDelayInMs}
          kind="ghost"
          label={t('downloadSchema', 'Download schema')}
          size={responsiveSize}
        >
          <Download />
        </IconButton>
      </a>
    );
  };

  const DeleteButton = () => {
    return (
      <IconButton
        enterDelayMs={defaultEnterDelayInMs}
        kind="ghost"
        label={t('deleteSchema', 'Delete schema')}
        onClick={launchDeleteClinicalViewsPackageModal}
        size={responsiveSize}
      >
        <TrashCan />
      </IconButton>
    );
  };

  return (
    <>
      <EditButton />
      <DownloadSchemaButton />
      <DeleteButton />
    </>
  );
}

function ContentPackagesList({ contentPackages, isValidating, mutate, t }: any) {
  const pageSize = 10;
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const [searchString, setSearchString] = useState('');

  const tableHeaders = [
    {
      header: t('packageName', 'Package name'),
      key: 'key',
    },
    {
      header: t('schemaActions', 'Schema actions'),
      key: 'actions',
    },
  ];

  const searchResults = useMemo(() => {
    const searchTerm = searchString?.trim().toLowerCase();

    if (searchTerm) {
      return mockContentPackages.filter((contentPackage) =>
        Object.keys(contentPackage).some((key) => key.toLowerCase().includes(searchTerm)),
      );
    }

    return mockContentPackages;
  }, [searchString]);

  const { paginated, goTo, results, currentPage } = usePagination(searchResults, pageSize);

  const tableRows = Array.from(results, (result) => {
    return Object.keys(result).map((key) => {
      const contentPackage = result[key];
      return {
        ...contentPackage,
        id: key,
        key: key,
        actions: <ActionButtons clinicalViews={contentPackage} mutate={mutate} responsiveSize={responsiveSize} t={t} />,
      };
    });
  }).flat();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      goTo(1);
      setSearchString(e.target.value);
    },
    [goTo, setSearchString],
  );

  return (
    <>
      <div className={styles.flexContainer}>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </div>
      <DataTable rows={tableRows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <>
            <TableContainer className={styles.tableContainer} data-testid="content-packages-table">
              <div className={styles.toolbarWrapper}>
                <TableToolbar className={styles.tableToolbar} size={responsiveSize}>
                  <TableToolbarContent className={styles.headerContainer}>
                    <TableToolbarSearch
                      expanded
                      className={styles.searchbox}
                      onChange={handleSearch}
                      placeholder={t('searchThisList', 'Search this list')}
                    />
                    <Button
                      kind="primary"
                      iconDescription={t('createNewClinicalView', 'Create a new clinical view')}
                      renderIcon={() => <Add size={16} />}
                      size={responsiveSize}
                      onClick={() =>
                        navigate({
                          to: `${window.spaBase}/clinical-views-builder/new`,
                        })
                      }
                    >
                      {t('createNewClinicalview', 'Create a new clinical view')}
                    </Button>
                  </TableToolbarContent>
                </TableToolbar>
              </div>
              <Table {...getTableProps()} className={styles.table}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key="row.id" {...getRowProps({ row })} data-testid={`content-package-row-${row.id}`}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t('noMatchingClinicalViewsToDisplay', 'No matching clinical views to display')}
                    </p>
                    <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </>
        )}
      </DataTable>
      {paginated && (
        <ContentPackagesBuilderPagination
          currentItems={results.length}
          totalItems={searchResults.length}
          onPageNumberChange={({ page }) => {
            goTo(page);
          }}
          pageNumber={currentPage}
          pageSize={pageSize}
        />
      )}
    </>
  );
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <main>
      <Header title={t('home', 'Home')} />
      <div className={styles.container}>
        {(() => {
          return (
            <ContentPackagesList contentPackages={mockContentPackages} isValidating={false} mutate={() => {}} t={t} />
          );
        })()}
      </div>
    </main>
  );
};

export default Dashboard;
