import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  TextInput,
  Select,
  SelectItem,
} from '@carbon/react';
import { isDesktop, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { type Schema, type Form as FormType, type ExtensionSlot } from '../../types';
import styles from './modals.scss';
import { useEncounterTypes } from '../../hooks/useEncounter';

interface ConfigureDashboardModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  closeModal: () => void;
  slotName: string;
}

const ConfigureDashboardModal: React.FC<ConfigureDashboardModalProps> = ({
  schema,
  onSchemaChange,
  closeModal,
  slotName,
}) => {
  const { t } = useTranslation();
  const [selectedWidget, setSelectedWidget] = useState('');
  const [tabName, setTabName] = useState('');
  const [displayTitle, setDisplayTitle] = useState('');
  const [encounterType, setEncounterType] = useState('');
  const desktopLayout = isDesktop(useLayoutType());
  const { isLoading, encounterTypes, encounterTypesError } = useEncounterTypes();

  const availableWidgets = [
    { uuid: 'encounter-list-table-tabs', value: 'Encounter list table' },
    { uuid: 'program-summary', value: 'Encounter tile' },
  ];

  const newExtensionSlot = {
    [slotName]: {
      add: [slotName],
      configure: {
        [slotName]: {
          title: tabName,
          slotName: slotName,
          isExpanded: true,
          tabDefinitions: [
            {
              tabName: tabName,
              headerTitle: tabName,
              displayText: displayTitle,
              encounterType: encounterType,
              columns: [],
            },
          ],
        },
      },
    } as ExtensionSlot,
  };
  const updateSchema = () => {
    try {
      const updatedSchema = {
        ...schema,
        '@openmrs/esm-patient-chart-app': {
          ...schema['@openmrs/esm-patient-chart-app'],
          extensionSlots: {
            ...schema['@openmrs/esm-patient-chart-app'].extensionSlots,
            ...newExtensionSlot,
          },
        },
      };

      onSchemaChange(updatedSchema);

      // Show success notification
      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('submenuCreated', 'New submenu created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingSubmenu', 'Error creating submenu'),
          kind: 'error',
          subtitle: error.message,
        });
      }
    }
  };

  const handleCreateWidget = () => {
    updateSchema();
    closeModal();
  };

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('createNewSubMenu', 'Create a new submenu')}
      />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <Stack gap={5}>
            <FormGroup legendText={''}>
              <TextInput required readOnly id="slotName" labelText={t('slotName', 'Slot name')} value={slotName} />
              <Select
                labelText={t('selectWidget', 'Select a widget')}
                id="widget"
                invalidText="Required"
                className={styles.label}
                value={selectedWidget}
                onChange={(event) => {
                  setSelectedWidget(event.target.value);
                }}
              >
                {!selectedWidget && <SelectItem text={t('selectWidget', 'Select a widget')} />}
                {availableWidgets.length === 0 && <SelectItem text={t('noWidgetsAvailable', 'No widgets available')} />}
                {availableWidgets?.length > 0 &&
                  availableWidgets.map((widget) => (
                    <SelectItem key={widget.uuid} text={widget.value} value={widget.value}>
                      {widget.value}
                    </SelectItem>
                  ))}
              </Select>
            </FormGroup>

            {selectedWidget === 'encounter-list-table-tabs' && (
              <FormGroup legendText={t('configureColumns', 'Configure columns')}>
                <TextInput
                  required
                  id="tabName"
                  labelText={t('tabName', 'Tab name')}
                  placeholder={t('tabNamePlaceholder', 'e.g. Clinical Visit')}
                  value={tabName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTabName(event.target.value)}
                  className={styles.label}
                />
                <TextInput
                  required
                  id="displayTitle"
                  labelText={t('displayTitle', 'Display title')}
                  placeholder={t('displayTitlePlaceholder', 'e.g. Clinical Visit Encounters')}
                  value={displayTitle}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDisplayTitle(event.target.value)}
                  className={styles.label}
                />
                <Select
                  labelText={t('selectEncounterType', 'Select an encounter type')}
                  id="encounterType"
                  invalidText="Required"
                  className={styles.label}
                  value={encounterType}
                  onChange={(event) => {
                    setEncounterType(event.target.value);
                  }}
                >
                  {!encounterType && <SelectItem text={t('selectEncounterType', 'Select an encounter type')} />}
                  {encounterTypes.length === 0 ||
                    (encounterTypesError && (
                      <SelectItem text={t('noEncounterTypesAvailable', 'No encounter types available')} />
                    ))}
                  {encounterTypes?.length > 0 &&
                    encounterTypes.map((encounterType) => (
                      <SelectItem key={encounterType.uuid} text={encounterType.display} value={encounterType.display}>
                        {encounterType.display}
                      </SelectItem>
                    ))}
                </Select>
              </FormGroup>
            )}
          </Stack>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!selectedWidget} onClick={handleCreateWidget}>
          <span>{t('createSubMenu', 'Create Submenu')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default ConfigureDashboardModal;
