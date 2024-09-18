import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  IconButton,
  InlineLoading,
  InlineNotification,
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
  Tag,
  Tile,
} from '@carbon/react';
import { Add, DocumentImport, Download, Edit, TrashCan } from '@carbon/react/icons';
import { type KeyedMutator, preload } from 'swr';
import { CardHeader, EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../../config-schema';
import { FormBuilderPagination } from '../pagination';

import Header from '../header/header.component';
import styles from './dashboard.scss';
import { mockContentPackages } from '../../../__mocks__/content-packages.mock';
import { navigate, ConfigurableLink, useLayoutType, usePagination, useConfig } from '@openmrs/esm-framework';
import { AppConfig, type ContentPackage } from '../../types';

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

interface FormsListProps {
  clinicalViews: Array<any>;
  isValidating: boolean;
  mutate: Mutator;
  t: TFunction;
}

function CustomTag({ condition }: { condition?: boolean }) {
  const { t } = useTranslation();

  if (condition) {
    return (
      <Tag type="green" size="md" title="Clear Filter" data-testid="yes-tag">
        {t('yes', 'Yes')}
      </Tag>
    );
  }

  return (
    <Tag type="red" size="md" title="Clear Filter" data-testid="no-tag">
      {t('no', 'No')}
    </Tag>
  );
}

function ActionButtons({ clinicalViews, mutate, responsiveSize, t }: ActionButtonsProps) {
  const defaultEnterDelayInMs = 300;

  const launchDeleteFormModal = {};

  const ImportButton = () => {
    return (
      <IconButton
        align="center"
        enterDelayMs={defaultEnterDelayInMs}
        label={t('import', 'Import')}
        kind="ghost"
        onClick={() => navigate({ to: `${window.spaBase}/clinical-views-builder/edit/${clinicalViews}` })}
        size={responsiveSize}
      >
        <DocumentImport />
      </IconButton>
    );
  };

  const EditButton = () => {
    return (
      <IconButton
        enterDelayMs={defaultEnterDelayInMs}
        kind="ghost"
        label={t('editSchema', 'Edit schema')}
        onClick={() =>
          navigate({
            to: `${window.spaBase}/form-builder/edit/${clinicalViews}`,
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
        onClick={launchDeleteFormModal}
        size={responsiveSize}
      >
        <TrashCan />
      </IconButton>
    );
  };

  return (
    <>
      {mockContentPackages ? (
        <ImportButton />
      ) : (
        <>
          <EditButton />
          <DownloadSchemaButton />
        </>
      )}
      <DeleteButton />
    </>
  );
}

function ContentPackagesList({ contentPackages, isValidating, mutate, t }: any) {
  const pageSize = 10;
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const [filter, setFilter] = useState('');
  const [searchString, setSearchString] = useState('');

  const filteredRows = useMemo(() => {
    if (!filter) {
      return contentPackages;
    }

    if (filter === 'Published') {
      return contentPackages.filter((form) => form.published);
    }

    if (filter === 'Unpublished') {
      return contentPackages.filter((form) => !form.published);
    }

    if (filter === 'Retired') {
      return contentPackages.filter((form) => form.retired);
    }

    return contentPackages;
  }, [filter, contentPackages]);

  const tableHeaders = [
    {
      header: t('packageName', 'Package name'),
      key: 'key',
    },
    {
      header: t('version', 'Version'),
      key: 'version',
    },
    {
      header: t('retired', 'Retired'),
      key: 'retired',
    },
    {
      header: t('schemaActions', 'Schema actions'),
      key: 'actions',
    },
  ];

  const editSchemaUrl = '${openmrsSpaBase}/clinical-views-builder/edit/${uuid}';

  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      return filteredRows.filter((form) => form.name.toLowerCase().includes(searchString.toLowerCase()));
    }

    return filteredRows;
  }, [searchString, filteredRows]);

  const { paginated, goTo, results, currentPage } = usePagination(searchResults, pageSize);

  const tableRows = Array.from(results, (result) => {
    return Object.keys(result).map((key) => {
      const form = result[key];
      return {
        ...form,
        id: key,
        key: key,
        name: '',
        published: <CustomTag condition={false} />,
        retired: <CustomTag condition={false} />,
        actions: <ActionButtons clinicalViews={form} mutate={mutate} responsiveSize={responsiveSize} t={t} />,
      };
    });
  }).flat();

  const handleFilter = ({ selectedItem }: { selectedItem: string }) => setFilter(selectedItem);

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
        <div className={styles.filterContainer}>
          <Dropdown
            className={styles.filterDropdown}
            id="publishStatusFilter"
            initialSelectedItem={'All'}
            label=""
            titleText={t('filterBy', 'Filter by') + ':'}
            size={responsiveSize}
            type="inline"
            items={['All', 'Published', 'Unpublished', 'Retired']}
            onChange={handleFilter}
          />
        </div>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </div>
      <DataTable rows={tableRows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <>
            <TableContainer className={styles.tableContainer} data-testid="forms-table">
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
                    <TableRow key="row.id" {...getRowProps({ row })} data-testid={`form-row-${row.id}`}>
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
        <FormBuilderPagination
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
  const { showSchemaSaveWarning } = useConfig<ConfigObject>();

  return (
    <main>
      <Header title={t('home', 'Home')} />
      <div className={styles.container}>
        {(() => {
          //   if (error) {
          //     return <ErrorState error={error} />;
          //   }

          //   if (isLoading) {
          //     return <DataTableSkeleton role="progressbar" />;
          //   }

          //   if (mockContentPackages.length === 0) {
          //     return <EmptyState />;
          //   }

          return (
            <>
              {showSchemaSaveWarning && (
                <InlineNotification
                  className={styles.warningMessage}
                  kind="info"
                  lowContrast
                  title={t(
                    'schemaSaveWarningMessage',
                    "The dev3 server is ephemeral at best and can't be relied upon to save your schemas permanently. To avoid losing your work, please save your schemas to your local machine. Alternatively, upload your schema to the distro repo to have it persisted across server resets.",
                  )}
                />
              )}
              <ContentPackagesList contentPackages={mockContentPackages} isValidating={false} mutate={() => {}} t={t} />
            </>
          );
        })()}
      </div>
    </main>
  );
};

export default Dashboard;
