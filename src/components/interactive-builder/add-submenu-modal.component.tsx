import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, Stack, TextInput } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { type Schema, type ExtensionSlot } from '../../types';
import styles from './modals.scss';

interface NewSubMenuModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  closeModal: () => void;
}

const NewSubMenuModal: React.FC<NewSubMenuModalProps> = ({ schema, onSchemaChange, closeModal }) => {
  const { t } = useTranslation();
  const [programName, setProgramName] = useState('');
  const [menuName, setMenuName] = useState('');
  const [slotName, setSlotName] = useState('');

  const formatProgramIdentifier = (program: string): string => {
    return program
      .split(' ')
      .map((word) => word[0].toLowerCase())
      .join('');
  };

  const createSubmenuKey = (programShort: string, menu: string): string => {
    return `dashboard#${programShort}-${menu.split(' ').join('-').toLowerCase()}`;
  };

  const createSlot = (programShort: string, menu: string): string => {
    return `${programShort}-${menu.split(' ').join('-').toLowerCase()}-dashboard-slot`;
  };

  const findSlotNameDynamically = useCallback(() => {
    const patientChartSlot = schema['@openmrs/esm-patient-chart-app']?.extensionSlots?.['patient-chart-dashboard-slot'];
    if (patientChartSlot && patientChartSlot.configure) {
      const navGroupKey = Object.keys(patientChartSlot.configure).find(
        (key) => key.startsWith('nav-group#') && patientChartSlot.configure[key]?.slotName,
      );
      if (navGroupKey) {
        return patientChartSlot.configure[navGroupKey]?.slotName;
      }
    }
    return null;
  }, [schema]);

  useEffect(() => {
    const slot = findSlotNameDynamically();
    if (slot) {
      setSlotName(slot);
    } else {
      showSnackbar({
        title: t('errorFindingSlotName', 'Error'),
        kind: 'error',
        subtitle: t('slotNameNotFound', 'Slot name not found in the schema'),
      });
    }
  }, [schema, findSlotNameDynamically, t]);

  const existingSlot = schema['@openmrs/esm-patient-chart-app'].extensionSlots[slotName] || {
    add: [],
    configure: {},
  };

  const updateSchema = () => {
    try {
      const programShort = formatProgramIdentifier(programName);
      const key = createSubmenuKey(programShort, menuName);
      const slot = createSlot(programShort, menuName);

      const updatedSchema = {
        ...schema,
        '@openmrs/esm-patient-chart-app': {
          ...schema['@openmrs/esm-patient-chart-app'],
          extensionSlots: {
            ...schema['@openmrs/esm-patient-chart-app'].extensionSlots,
            [slotName]: {
              add: [...existingSlot.add, key],
              configure: {
                ...existingSlot.configure,
                [key]: {
                  title: menuName,
                  path: key.split('#')[1],
                  slot,
                },
              },
            } as ExtensionSlot,
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

  const handleCreateSubmenu = () => {
    if (programName && menuName) {
      updateSchema();
      closeModal();
    }
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
              <TextInput
                required
                id="programName"
                labelText={t('programIdentifier', 'Program Identifier')}
                placeholder={t('programIdentifierPlaceholder', 'e.g. Hiv Care and Treatment')}
                value={programName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setProgramName(event.target.value)}
              />
            </FormGroup>
            <FormGroup legendText={''}>
              <TextInput
                required
                id="menuName"
                labelText={t('menuName', 'Menu Name')}
                placeholder={t('menuNamePlaceholder', 'e.g. Patient Summary')}
                value={menuName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMenuName(event.target.value)}
              />
            </FormGroup>
          </Stack>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!programName || !menuName} onClick={handleCreateSubmenu}>
          <span>{t('createSubMenu', 'Create Submenu')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default NewSubMenuModal;
