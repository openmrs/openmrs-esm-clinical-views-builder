import React, { useCallback, useMemo, useState, useEffect, type Dispatch, type SetStateAction } from 'react';
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
import { ContentPackagesBuilderPagination } from '../pagination';

import Header from '../header/header.component';
import styles from './dashboard.scss';
import { navigate, useLayoutType, usePagination, ConfigurableLink, showModal } from '@openmrs/esm-framework';
import { getAllPackagesFromLocalStorage, deletePackageFromLocalStorage } from '../../utils';
import { type ContentPackage } from '../../types';

interface ActionButtonsProps {
  responsiveSize: string;
  clinicalViewKey: string;
  t: TFunction;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
  onDownload: (key: string) => void;
}

export function ActionButtons({
  responsiveSize,
  clinicalViewKey,
  t,
  onDelete,
  onDownload,
  onEdit,
}: ActionButtonsProps) {
  const defaultEnterDelayInMs = 300;

  const launchDeleteClinicalViewsPackageModal = () => {
    const dispose = showModal('delete-clinicalView-modal', {
      closeModal: () => dispose(),
      clinicalViewKey,
      onDelete,
    });
  };

  const EditButton = () => {
    return (
      <IconButton
        enterDelayMs={defaultEnterDelayInMs}
        kind="ghost"
        label={t('editSchema', 'Edit schema')}
        onClick={onEdit}
        size={responsiveSize}
      >
        <Edit />
      </IconButton>
    );
  };

  const DownloadSchemaButton = () => {
    return (
      <a download={`${clinicalViewKey}.json`} href="#">
        <IconButton
          enterDelayMs={defaultEnterDelayInMs}
          kind="ghost"
          label={t('downloadSchema', 'Download schema')}
          onClick={onDownload}
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

interface ContentPackagesListProps {
  t: TFunction;
  clinicalViews: ContentPackage[];
  setClinicalViews: Dispatch<SetStateAction<any[]>>;
}

export function ContentPackagesList({ t, clinicalViews, setClinicalViews }: ContentPackagesListProps) {
  const pageSize = 10;
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const [searchString, setSearchString] = useState('');

  const filteredViews = useMemo(() => {
    const searchTerm = searchString.trim().toLowerCase();
    return clinicalViews?.filter((pkg) => Object.keys(pkg)[0]?.toLowerCase().includes(searchTerm));
  }, [clinicalViews, searchString]);

  const handleEdit = (packageKey: string) => {
    navigate({
      to: `${window.spaBase}/clinical-views-builder/edit/${packageKey}`,
    });
  };

  const handleDelete = (packageKey: string) => {
    deletePackageFromLocalStorage(packageKey);
    setClinicalViews(clinicalViews?.filter((pkg) => Object.keys(pkg)[0] !== packageKey));
  };

  const tableHeaders = [
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('dashboards', 'Dashboards'),
      key: 'dashboards',
    },
    {
      header: t('schemaActions', 'Schema actions'),
      key: 'actions',
    },
  ];

  const { paginated, goTo, results, currentPage } = usePagination(filteredViews, pageSize);

  const handleDownload = (key) => {
    let url;
    let anchor;
    try {
      const schema = localStorage.getItem(key);
      if (!schema) {
        console.error('No schema found to download.');
        return;
      }

      const blob = new Blob([schema], {
        type: 'application/json;charset=utf-8',
      });
      url = URL.createObjectURL(blob);

      anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${key}.json`;
      document.body.appendChild(anchor);
      anchor.click();
    } catch (error) {
      console.error('Error downloading schema:', error);
    } finally {
      if (url) {
        URL.revokeObjectURL(url);
      }
      if (anchor && anchor.parentNode) {
        anchor.parentNode.removeChild(anchor);
      }
    }
  };

  const getNavGroupTitle = (schema) => {
    const packageSlotKey = 'patient-chart-dashboard-slot';
    const packageConfig = schema?.['@openmrs/esm-patient-chart-app']?.extensionSlots[packageSlotKey];

    if (packageConfig) {
      const navGroupKey = packageConfig?.add[0];
      const navGroupConfig = packageConfig?.configure[navGroupKey];
      return navGroupConfig?.title || 'Unnamed Clinical View';
    }

    return 'default_schema_name';
  };

  const getDashboardTitles = (schema) => {
    const packageSlotKey = 'patient-chart-dashboard-slot';

    const packageConfig = schema?.['@openmrs/esm-patient-chart-app']?.extensionSlots?.[packageSlotKey];

    const navGroupKey = packageConfig?.add?.[0];
    const navGroupConfig = packageConfig?.configure?.[navGroupKey];

    const submenuSlotKey = navGroupConfig?.slotName;
    const submenuConfig = schema?.['@openmrs/esm-patient-chart-app']?.extensionSlots?.[submenuSlotKey];

    if (submenuConfig && submenuConfig.add) {
      const dashboardTitles = submenuConfig.add.map((dashboardKey) => {
        return submenuConfig.configure?.[dashboardKey]?.title || 'Unnamed Dashboard';
      });

      return dashboardTitles.length ? dashboardTitles.join(', ') : 'No dashboards available';
    }

    return 'No dashboards available';
  };

  const tableRows = results.map((contentPackage) => {
    const clinicalViewName = getNavGroupTitle(contentPackage);
    const dashboardTitles = getDashboardTitles(contentPackage);

    const key = Object.keys(contentPackage)[1];

    return {
      id: contentPackage.key,
      name: (
        <ConfigurableLink
          className={styles.link}
          to={`${window.spaBase}/clinical-views-builder/edit/${contentPackage.id}`}
          templateParams={{ clinicalViewUuid: key }}
        >
          {clinicalViewName}
        </ConfigurableLink>
      ),
      dashboards: dashboardTitles,
      actions: (
        <ActionButtons
          responsiveSize={responsiveSize}
          clinicalViewKey={key}
          t={t}
          onEdit={() => handleEdit(key)}
          onDelete={() => handleDelete(key)}
          onDownload={() => handleDownload(key)}
        />
      ),
    };
  });

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      goTo(1);
      setSearchString(e.target.value);
    },
    [goTo, setSearchString],
  );

  return (
    <>
      <div className={styles.tableHeading}>{t('clinicalViewsTableHeader', 'Clinical Views List')}</div>
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
                      {t('createNewClinicalView', 'Create a new clinical view')}
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
                  {rows.map((row, key) => (
                    <TableRow key={key} {...getRowProps({ row })} data-testid={`content-package-row-${row.id}`}>
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
          totalItems={filteredViews.length}
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
  const [clinicalViews, setClinicalViews] = useState<any[]>([]);

  useEffect(() => {
    const packages = getAllPackagesFromLocalStorage();
    setClinicalViews(Object.entries(packages).map(([key, value]) => ({ key, ...(value as object) })));
  }, []);

  return (
    <main>
      <Header title={t('home', 'Home')} />
      <div className={styles.container}>
        {(() => {
          return <ContentPackagesList t={t} clinicalViews={clinicalViews} setClinicalViews={setClinicalViews} />;
        })()}
      </div>
    </main>
  );
};

export default Dashboard;
