import React from 'react';
import {
  type ExtensionSlot,
  type DashboardConfig,
  type Schema,
  type TabDefinition,
  type WidgetTypes,
} from '../../types';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, Stack } from '@carbon/react';
import styles from './modals.scss';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';

interface DeleteConfigDetailModalProps {
  closeModal: () => void;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  slotDetails: DashboardConfig;
  tabDefinition: TabDefinition;
  configurationKey: string;
  widgetType: WidgetTypes;
}

const DeleteConfigDetailModal: React.FC<DeleteConfigDetailModalProps> = ({
  schema,
  onSchemaChange,
  closeModal,
  slotDetails,
  tabDefinition,
  configurationKey,
  widgetType,
}) => {
  const { t } = useTranslation();
  const schemaBasePath = schema['@openmrs/esm-patient-chart-app'];

  const updateSchema = (schema: Schema) => {
    try {
      const updatedSchema = {
        ...schema,
        '@openmrs/esm-patient-chart-app': {
          ...schemaBasePath,
          extensionSlots: {
            ...schemaBasePath.extensionSlots,
            [slotDetails?.slot]: {
              ...schemaBasePath.extensionSlots[slotDetails?.slot],
              configure: {
                ...schemaBasePath.extensionSlots[slotDetails?.slot]?.configure,
                [configurationKey]: {
                  ...schemaBasePath.extensionSlots[slotDetails?.slot]?.configure[configurationKey],
                  [widgetType]: schemaBasePath.extensionSlots[slotDetails?.slot]?.configure[configurationKey]?.[
                    widgetType
                  ]?.filter((def) => {
                    const retainedConfigs = def.tabName !== tabDefinition.tabName;
                    return retainedConfigs;
                  }),
                },
              },
            } as ExtensionSlot,
          },
        },
      };

      onSchemaChange(updatedSchema);
      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('tabConfigurationDeleted', 'Tab configuration deleted'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorDeletingConfiguration', 'Error deleting configuration'),
          kind: 'error',
          subtitle: error.message,
        });
      }
    }
  };

  const handleDeleteConfiguration = () => {
    updateSchema(schema);
    closeModal();
  };
  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('deleteConfigDetailsConfirmationText', 'Are you sure you want to delete this configuration?')}
      />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <Stack gap={5}>
            <p>
              {t('menuSlot', 'Menu Slot')} : {slotDetails?.slot}
            </p>
            <p className={styles.subheading}>
              {t('tabName', 'Tab name')} : {tabDefinition?.tabName}
            </p>
            <p className={styles.subheading}>
              {t('headerTitle', 'Header title')} : {tabDefinition?.headerTitle}
            </p>
          </Stack>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={handleDeleteConfiguration}>
          <span>{t('deleteConfiguration', 'Delete configuration')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteConfigDetailModal;
