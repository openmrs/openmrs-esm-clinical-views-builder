import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, TextInput } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '../../types';

import styles from './modals.scss';

interface PackageModalProps {
  closeModal: () => void;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
}

const toCamelCase = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => (index === 0 ? match.toLowerCase() : match.toUpperCase()))
    .replace(/\s+/g, '');
};

const isValidSlotName = (slotName: string) => {
  return /^[a-zA-Z0-9-]+$/.test(slotName);
};

const PackageModal: React.FC<PackageModalProps> = ({ closeModal, schema, onSchemaChange }) => {
  const { t } = useTranslation();
  const [key, setKey] = useState('');
  const [title, setTitle] = useState('');
  const [slotName, setSlotName] = useState('');
  const [slotNameError, setSlotNameError] = useState('');

  useEffect(() => {
    if (title) {
      setKey(toCamelCase(title));
    }
  }, [title]);

  const handleSlotNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setSlotName(inputValue);

    if (!isValidSlotName(inputValue)) {
      setSlotNameError(
        t('invalidSlotName', 'Slot name must contain only letters, numbers, and dashes, with no spaces'),
      );
    } else {
      setSlotNameError('');
    }
  };

  const handleUpdatePackageTitle = () => {
    if (!slotNameError && key && title && slotName) {
      updatePackages();
      closeModal();
    }
  };

  const updatePackages = () => {
    try {
      if (title && slotName) {
        const updatedSchema = {
          ...schema,
          '@openmrs/esm-patient-chart-app': {
            ...schema['@openmrs/esm-patient-chart-app'],
            extensionSlots: {
              ...schema['@openmrs/esm-patient-chart-app'].extensionSlots,
              'patient-chart-dashboard-slot': {
                add: [
                  ...(schema['@openmrs/esm-patient-chart-app'].extensionSlots['patient-chart-dashboard-slot']?.add ||
                    []),
                  `nav-group#${key}`,
                ],
                configure: {
                  ...schema['@openmrs/esm-patient-chart-app'].extensionSlots['patient-chart-dashboard-slot']?.configure,
                  [`nav-group#${key}`]: {
                    title,
                    slotName,
                    isExpanded: true,
                  },
                },
              },
            },
          },
        };

        onSchemaChange(updatedSchema);

        setTitle('');
        setSlotName('');
      }

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('packageCreated', 'New package created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingPackage', 'Error creating package'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        title={t('createNewClinicalView', 'Create a new clinical view')}
        closeModal={closeModal}
      />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <FormGroup legendText={''}>
            <TextInput
              id="clinicalViewTitle"
              labelText={t('enterClinicalViewTitle', 'Enter a title for your new clinical view')}
              value={title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
            />
          </FormGroup>
          <FormGroup legendText={''}>
            <TextInput
              id="slotName"
              labelText={t('enterSlotName', 'Enter slot name')}
              value={slotName}
              onChange={handleSlotNameChange}
              invalid={!!slotNameError}
              invalidText={slotNameError}
            />
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={closeModal} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!title || !slotName || !!slotNameError} onClick={handleUpdatePackageTitle}>
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default PackageModal;
