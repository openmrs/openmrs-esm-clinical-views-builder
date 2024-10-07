import React, { useCallback } from 'react';
import { showModal, AddIcon, EditIcon } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { Button, Accordion, AccordionItem, Tile } from '@carbon/react';
import { DefinitionTypes, type DynamicExtensionSlot, type Schema } from '../../types';
import styles from './interactive-builder.scss';
import { getSubMenuSlotDetails } from '../../helpers';

interface InteractiveBuilderProps {
  schema: Schema;
  onSchemaChange: (updatedSchema: Schema) => void;
}

const InteractiveBuilder = ({ schema, onSchemaChange }: InteractiveBuilderProps) => {
  const { t } = useTranslation();

  const initializeSchema = useCallback(() => {
    const dummySchema: Schema = {
      id: uuidv4(),
      '@openmrs/esm-patient-chart-app': {
        extensionSlots: {
          'patient-chart-dashboard-slot': {
            add: [],
            configure: {},
          },
        },
      },
    };

    if (!schema) {
      onSchemaChange(dummySchema);
      return dummySchema;
    }

    return schema || dummySchema;
  }, [onSchemaChange, schema]);

  const launchAddClinicalViewModal = useCallback(() => {
    const schema = initializeSchema();
    const dispose = showModal('new-package-modal', {
      closeModal: () => dispose(),
      schema,
      onSchemaChange,
    });
  }, [onSchemaChange, initializeSchema]);

  const launchAddClinicalViewMenuModal = useCallback(() => {
    const dispose = showModal('new-menu-modal', {
      closeModal: () => dispose(),
      schema,
      onSchemaChange,
    });
  }, [schema, onSchemaChange]);

  const handleConfigureDashboardModal = useCallback(
    (slotName) => {
      const dispose = showModal('configure-dashboard-modal', {
        closeModal: () => dispose(),
        schema,
        onSchemaChange,
        slotName,
      });
    },
    [schema, onSchemaChange],
  );

  const handleConfigureColumnsModal = useCallback(
    (slotDetails, tabDefinition, definitionType) => {
      const dispose = showModal('configure-columns-modal', {
        closeModal: () => dispose(),
        schema,
        onSchemaChange,
        slotDetails,
        tabDefinition,
        definitionType,
      });
    },
    [schema, onSchemaChange],
  );

  const getNavGroupTitle = (schema) => {
    if (schema) {
      const navGroupKey = Object.keys(
        schema['@openmrs/esm-patient-chart-app'].extensionSlots['patient-chart-dashboard-slot'].configure,
      )[0];

      if (navGroupKey) {
        return schema['@openmrs/esm-patient-chart-app'].extensionSlots['patient-chart-dashboard-slot'].configure[
          navGroupKey
        ].title;
      }
    }
    return null;
  };

  const navGroupTitle = getNavGroupTitle(schema);

  const packageSlotKey = 'patient-chart-dashboard-slot';
  const packageConfig = schema?.['@openmrs/esm-patient-chart-app'].extensionSlots[packageSlotKey];

  const navGroupKey = packageConfig?.add[0];
  const navGroupConfig = packageConfig?.configure[navGroupKey];

  const submenuSlotKey = navGroupConfig?.slotName;
  const submenuConfig = schema?.['@openmrs/esm-patient-chart-app']?.extensionSlots[
    submenuSlotKey
  ] as DynamicExtensionSlot;

  return (
    <div className={styles.interactiveBuilderContainer}>
      {!navGroupTitle ? (
        <div className={styles.topHeader}>
          <span className={styles.explainer}>
            {t(
              'interactiveBuilderHelperText',
              'The Interactive Builder lets you build your clinical view schema without writing JSON code. When done, click Save Package to save your clinical view package.',
            )}
          </span>
          <Button onClick={launchAddClinicalViewModal} className={styles.startButton} kind="ghost">
            {t('startBuilding', 'Start Building')}
          </Button>
        </div>
      ) : (
        <span className={styles.explainer}>
          {t('interactiveBuilderInfo', 'Continue adding sub menus and configuring dashboards')}
        </span>
      )}

      {schema && (
        <div>
          <div className={styles.packageLabel}>{navGroupTitle}</div>
          <div className={styles.subHeading}>{t('clinicalViewMenus', 'Clinical View Submenus')}</div>
          {submenuConfig ? (
            submenuConfig.add?.map((submenuKey) => {
              const submenuDetails = submenuConfig?.configure[submenuKey];
              const subMenuSlot = submenuDetails?.slot;
              const subMenuSlotDetails = getSubMenuSlotDetails(schema, subMenuSlot);
              const configurationKey =
                typeof subMenuSlotDetails?.configure === 'object' && Object.keys(subMenuSlotDetails?.configure)?.[0];
              return (
                <Accordion key={submenuKey}>
                  <AccordionItem title={submenuDetails?.title}>
                    <p>
                      {t('menuSlot', 'Menu Slot')} : {submenuDetails?.slot}
                    </p>
                    <p style={{ opacity: 0.5 }}>
                      {t(
                        'helperTextForAddDasboards',
                        'Now configure dashboards to show on the patient chart when this submenu is clicked.',
                      )}
                    </p>

                    {subMenuSlotDetails?.configure?.[configurationKey]?.tabDefinitions?.map((tabDefinition) => (
                      <Tile className={styles.tileContainer}>
                        <div className={styles.editStatusIcon}>
                          <Button
                            size="md"
                            kind={'tertiary'}
                            hasIconOnly
                            renderIcon={(props) => <EditIcon size={16} {...props} />}
                            iconDescription={t('editTabDefinition', 'Edit tab definition')}
                          />
                        </div>
                        <p className={styles.subheading}>{t('tabName', 'Tab name')}</p>
                        <p>{tabDefinition?.tabName}</p>
                        <p className={styles.subheading}>{t('headerTitle', 'Header title')}</p>
                        <p>{tabDefinition?.headerTitle}</p>
                        <p className={styles.subheading}>{t('columns', 'Columns')}</p>
                        {tabDefinition?.columns.map((column) => (
                          <div className={styles.tileContent}>
                            <p className={styles.content}>
                              {t('title', 'Title')} : {column.title ?? '--'}
                            </p>
                            <p className={styles.content}>
                              {t('concept', 'Concept')} : {column.concept ?? '--'}
                            </p>
                            <p className={styles.content}>
                              {column.isDate && (
                                <>
                                  {t('date', 'Date')} : {column.isDate.toString() ?? '--'}
                                </>
                              )}
                            </p>
                            <p className={styles.content}>
                              {column.isLink && (
                                <>
                                  {t('link', 'Link')} : {column.isLink.toString() ?? '--'}
                                </>
                              )}
                            </p>
                          </div>
                        ))}
                        <Button
                          kind="ghost"
                          renderIcon={AddIcon}
                          onClick={() => {
                            handleConfigureColumnsModal(submenuDetails, tabDefinition, DefinitionTypes.TAB_DEFINITION);
                          }}
                        >
                          {t('configureColumns', 'Configure columns')}
                        </Button>
                      </Tile>
                    ))}

                    {subMenuSlotDetails?.configure[configurationKey]?.tilesDefinitions?.map((tileDefinition) => (
                      <Tile className={styles.tileContainer}>
                        <div className={styles.editStatusIcon}>
                          <Button
                            size="md"
                            kind={'tertiary'}
                            hasIconOnly
                            renderIcon={(props) => <EditIcon size={16} {...props} />}
                            iconDescription={t('editTileDefinition', 'Edit tile definition')}
                          />
                        </div>
                        <p className={styles.subheading}>{t('headerTitle', 'Header title')}</p>
                        <p>{tileDefinition?.tilesHeader}</p>
                        <p className={styles.subheading}>{t('columns', 'Columns')} </p>
                        {tileDefinition?.columns.map((column) => (
                          <div className={styles.tileContent}>
                            <p className={styles.content}>
                              {t('title', 'Title')} : {column.title ?? '--'}
                            </p>
                            <p className={styles.content}>
                              {t('concept', 'Concept')} : {column.concept ?? '--'}
                            </p>
                          </div>
                        ))}
                        <Button
                          kind="ghost"
                          renderIcon={AddIcon}
                          onClick={() => {
                            handleConfigureColumnsModal(
                              submenuDetails,
                              tileDefinition,
                              DefinitionTypes.TILE_DEFINITION,
                            );
                          }}
                        >
                          {t('configureColumns', 'Configure columns')}
                        </Button>
                      </Tile>
                    ))}
                    <Button
                      kind="ghost"
                      renderIcon={AddIcon}
                      onClick={() => {
                        handleConfigureDashboardModal(submenuDetails?.slot);
                      }}
                    >
                      {t('configureDashboard', 'Configure dashboard')}
                    </Button>
                  </AccordionItem>
                </Accordion>
              );
            })
          ) : (
            <p className={styles.smallParagraph}>
              {t('noSubmenusText', 'No submenus views added yet. Click the button to add a new submenu link.')}
            </p>
          )}
          <Button
            className={styles.addDashboardButton}
            kind="ghost"
            renderIcon={AddIcon}
            onClick={launchAddClinicalViewMenuModal}
            iconDescription={t('addSubmenu', 'Add Submenu')}
            disabled={!navGroupTitle}
          >
            {t('addClinicalViewSubMenu', 'Add Clinical view submenu')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default InteractiveBuilder;
