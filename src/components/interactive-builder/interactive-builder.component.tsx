import React, { useState, useCallback } from 'react';
import { showModal, AddIcon, EditIcon, TrashCanIcon, showSnackbar } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { Button, Accordion, AccordionItem, Tile, TextInput } from '@carbon/react';
import { DefinitionTypes, WidgetTypes, type DynamicExtensionSlot, type Schema } from '../../types';
import styles from './interactive-builder.scss';
import { getSubMenuSlotDetails } from '../../helpers';

interface InteractiveBuilderProps {
  schema: Schema;
  onSchemaChange: (updatedSchema: Schema) => void;
}

const InteractiveBuilder = ({ schema, onSchemaChange }: InteractiveBuilderProps) => {
  const { t } = useTranslation();
  const [editingTab, setEditingTab] = useState(null);
  const [editedTabName, setEditedTabName] = useState('');
  const [editedHeaderTitle, setEditedHeaderTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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

  const handleEditTab = (tabDefinition) => {
    setEditingTab(tabDefinition);
    setEditedTabName(tabDefinition.tabName);
    setEditedHeaderTitle(tabDefinition.headerTitle);
    setIsEditing(true);
  };

  const handleSaveTab = (submenuKey, tabIndex) => {
    const updatedSchema = JSON.parse(JSON.stringify(schema));

    // Get the dynamic key for the extension slots
    const extensionSlots = updatedSchema['@openmrs/esm-patient-chart-app'].extensionSlots;
    const extensionSlotKey = Object.keys(extensionSlots)[0]; // Assuming there is only one key, or get it based on your logic

    let configureEntry = extensionSlots[extensionSlotKey].configure[submenuKey];

    if (!configureEntry) {
      configureEntry = { tabDefinitions: [] };
      updatedSchema['@openmrs/esm-patient-chart-app'].extensionSlots[extensionSlotKey].configure[submenuKey] =
        configureEntry;
    }

    const updatedTabDefinition = {
      ...editingTab,
      tabName: editedTabName,
      headerTitle: editedHeaderTitle,
    };

    configureEntry.tabDefinitions[tabIndex] = updatedTabDefinition;

    onSchemaChange(updatedSchema);

    showSnackbar({
      title: t('success', 'Success!'),
      kind: 'success',
      isLowContrast: true,
      subtitle: t('tabEditedSuccessfully', 'Tab edited successfully!'),
    });

    setEditingTab(updatedTabDefinition);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditingTab(null);
    setEditedTabName('');
    setEditedHeaderTitle('');
    setIsEditing(false);
  };

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

  const handleDeleteConfigDetailModal = useCallback(
    (slotDetails, tabDefinition, configurationKey, widgetType) => {
      const dispose = showModal('delete-config-detail-modal', {
        closeModal: () => dispose(),
        schema,
        onSchemaChange,
        slotDetails,
        tabDefinition,
        configurationKey,
        widgetType,
      });
    },
    [schema, onSchemaChange],
  );

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
                    {subMenuSlotDetails?.configure?.[configurationKey]?.tabDefinitions?.map((tabDefinition, index) => (
                      <Tile className={styles.tileContainer} key={tabDefinition?.tabName}>
                        {editingTab === tabDefinition ? (
                          <>
                            <TextInput
                              id="tab-name"
                              labelText={t('tabName', 'Tab Name')}
                              value={editedTabName}
                              onChange={(e) => setEditedTabName(e.target.value)}
                            />
                            <TextInput
                              id="header-title"
                              labelText={t('headerTitle', 'Header Title')}
                              value={editedHeaderTitle}
                              onChange={(e) => setEditedHeaderTitle(e.target.value)}
                            />
                            <Button onClick={() => handleSaveTab(submenuKey, index)}>{t('save', 'Save')}</Button>
                            <Button kind="tertiary" onClick={handleCancelEdit}>
                              {t('cancel', 'Cancel')}
                            </Button>
                          </>
                        ) : (
                          <>
                            {editingTab && (
                              <>
                                <p className={styles.subheading}>{t('tabName', 'Tab name')}</p>
                                <p>{editingTab.tabName}</p>
                                <p className={styles.subheading}>{t('headerTitle', 'Header title')}</p>
                                <p>{editingTab.headerTitle}</p>
                              </>
                            )}
                            <div className={styles.editStatusIcon}>
                              <Button
                                size="md"
                                kind="tertiary"
                                hasIconOnly
                                renderIcon={(props) => <EditIcon size={16} {...props} />}
                                iconDescription={t('editTabDefinition', 'Edit tab definition')}
                                onClick={() => handleEditTab(tabDefinition)}
                              />
                              <Button
                                size="md"
                                kind="tertiary"
                                hasIconOnly
                                renderIcon={(props) => <TrashCanIcon size={16} {...props} />}
                                iconDescription={t('deleteTabDefinition', 'Delete tab definition')}
                                onClick={() => {
                                  handleDeleteConfigDetailModal(
                                    submenuDetails,
                                    tabDefinition,
                                    configurationKey,
                                    DefinitionTypes.TAB_DEFINITION,
                                  );
                                }}
                              />
                            </div>
                            <p className={styles.subheading}>{t('tabName', 'Tab name')}</p>
                            <p>{tabDefinition?.tabName}</p>
                            <p className={styles.subheading}>{t('headerTitle', 'Header title')}</p>
                            <p>{tabDefinition?.headerTitle}</p>
                            <p className={styles.subheading}>{t('columns', 'Columns')}</p>
                            {tabDefinition?.columns.map((column) => (
                              <div className={styles.tileContent} key={column.title}>
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
                                handleConfigureColumnsModal(
                                  submenuDetails,
                                  tabDefinition,
                                  DefinitionTypes.TAB_DEFINITION,
                                );
                              }}
                            >
                              {t('configureColumns', 'Configure columns')}
                            </Button>

                            {subMenuSlotDetails?.configure[configurationKey]?.tilesDefinitions?.map(
                              (tileDefinition) => (
                                <Tile className={styles.tileContainer} key={tileDefinition?.tilesHeader}>
                                  <div className={styles.editStatusIcon}>
                                    <Button
                                      size="md"
                                      kind="tertiary"
                                      hasIconOnly
                                      renderIcon={(props) => <EditIcon size={16} {...props} />}
                                      iconDescription={t('editTileDefinition', 'Edit tile definition')}
                                    />
                                    <Button
                                      size="md"
                                      kind="tertiary"
                                      hasIconOnly
                                      renderIcon={(props) => <TrashCanIcon size={16} {...props} />}
                                      iconDescription={t('deleteTileDefinition', 'Delete tile definition')}
                                      onClick={() => {
                                        handleDeleteConfigDetailModal(
                                          submenuDetails,
                                          tileDefinition,
                                          configurationKey,
                                          DefinitionTypes.TILE_DEFINITION,
                                        );
                                      }}
                                    />
                                  </div>
                                  <p className={styles.subheading}>{t('headerTitle', 'Header title')}</p>
                                  <p>{tileDefinition?.tilesHeader}</p>
                                  <p className={styles.subheading}>{t('columns', 'Columns')}</p>
                                  {tileDefinition?.columns.map((column) => (
                                    <div className={styles.tileContent} key={column.title}>
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
                              ),
                            )}
                          </>
                        )}
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
