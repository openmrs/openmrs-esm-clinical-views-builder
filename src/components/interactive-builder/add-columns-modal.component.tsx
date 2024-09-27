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
  Dropdown,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
} from '@carbon/react';
import { isDesktop, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import {
  type Schema,
  type Form as FormType,
  type TabDefinition,
  type ExtensionSlot,
  type DashboardConfig,
} from '../../types';
import styles from './modals.scss';
import { useForms } from '../../hooks/useForm';
import { useFormConcepts } from '../../hooks/useFormConcepts';
import { generateNodeId } from '../../helpers';

interface ConfigureDashboardModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  closeModal: () => void;
  slotDetails: DashboardConfig;
  tabDefinition: TabDefinition;
}

const ConfigureDashboardModal: React.FC<ConfigureDashboardModalProps> = ({
  schema,
  onSchemaChange,
  closeModal,
  slotDetails,
  tabDefinition,
}) => {
  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());
  const [columnTitle, setColumnTitle] = useState('');
  const [columnConcept, setColumnConcept] = useState('');
  const [isColumnDate, setIsColumnDate] = useState(false);
  const [isColumnLink, setIsColumnLink] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormType>();
  const { isLoadingForm, forms, formsError } = useForms();
  const { isLoadingFormConcepts, formConcepts, formConceptsError, mutate } = useFormConcepts(selectedForm);
  const schemaBasePath = schema['@openmrs/esm-patient-chart-app'];

  const updateSchema = (newColumns) => {
    try {
      const updatedSchema = {
        ...schema,
        '@openmrs/esm-patient-chart-app': {
          ...schemaBasePath,
          extensionSlots: {
            ...schemaBasePath.extensionSlots,
            [slotDetails?.slot]: {
              ...schemaBasePath.extensionSlots[slotDetails?.slot].add,
              configure: {
                ...schemaBasePath.extensionSlots[slotDetails?.slot]?.configure,
                [slotDetails?.slot]: {
                  ...schemaBasePath.extensionSlots[slotDetails?.slot]?.configure[slotDetails?.slot],
                  tabDefinitions: schemaBasePath.extensionSlots[slotDetails?.slot]?.configure[
                    slotDetails?.slot
                  ]?.tabDefinitions.map((tabDef) => {
                    if (tabDef.tabName === tabDefinition.tabName) {
                      // Match the tab definition you want to update
                      return {
                        ...tabDef,
                        columns: [
                          ...(tabDef.columns || []), // Existing columns or empty array
                          newColumns, // Add newColumns
                        ],
                      };
                    }
                    return tabDef; // Return unchanged tab definitions
                  }),
                },
              },
            } as ExtensionSlot,
          },
        },
      };
      onSchemaChange(updatedSchema);

      // Show success notification
      setColumnTitle('');
      setColumnConcept('');
      setIsColumnDate(false);
      setIsColumnLink(false);
      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('tabColumnsCreated', 'Tab columns created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingTabColumns', 'Error creating tab columns'),
          kind: 'error',
          subtitle: error.message,
        });
      }
    }
  };

  const handleCreateColumn = () => {
    const newColumns = {
      id: generateNodeId(columnTitle),
      title: columnTitle,
      concept: columnConcept,
      isDate: isColumnDate,
      isLink: isColumnLink,
    };

    updateSchema(newColumns);
    closeModal();
  };

  const handleFormChange = useCallback(({ selectedItem }) => {
    setSelectedForm(selectedItem);
  }, []);

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
            <FormGroup legendText={t('configureColumns', 'Configure columns')}>
              <Dropdown
                id="form"
                initialSelectedItem={forms[0]}
                label={t('selectform', 'Select form')}
                titleText={t('form', 'Form') + ':'}
                items={[...forms]}
                itemToString={(item) => item.display}
                onChange={handleFormChange}
                size={desktopLayout ? 'md' : 'lg'}
                className={styles.label}
              />
              <Select
                labelText={t('selectConcept', 'Select a concept')}
                id="concept"
                invalidText="Required"
                className={styles.label}
                value={columnConcept}
                onChange={(event) => {
                  setColumnConcept(event.target.value);
                }}
              >
                {!columnConcept && <SelectItem text={t('selectConcept', 'Select a concept')} />}
                {formConcepts.length === 0 ||
                  (formConceptsError && <SelectItem text={t('noConceptsAvailable', 'No concepts available')} />)}
                {formConcepts?.length > 0 &&
                  formConcepts.map((concept) => (
                    <SelectItem key={concept.concept} text={concept.label} value={concept.concept}>
                      {concept.label}
                    </SelectItem>
                  ))}
              </Select>
              <TextInput
                required
                id="columnTitle"
                labelText={t('columnTitle', 'Column Title')}
                placeholder={t('columnTitlePlaceholder', 'e.g. Visit title')}
                value={columnTitle}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setColumnTitle(event.target.value)}
                className={styles.label}
              />
              <RadioButtonGroup
                name="isDate"
                orientation="horizontal"
                legendText={t('isDate', 'Is date')}
                className={styles.label}
                defaultSelected={isColumnDate}
                onChange={(event) => setIsColumnDate(event.toString())}
              >
                <RadioButton
                  className={styles.radioButton}
                  id="isDateTrue"
                  labelText={t('true', 'True')}
                  value={true}
                />
                <RadioButton
                  className={styles.radioButton}
                  id="isDateFalse"
                  labelText={t('false', 'False')}
                  value={false}
                />
              </RadioButtonGroup>

              <RadioButtonGroup
                name="isLink"
                orientation="horizontal"
                legendText={t('isLink', 'Is link')}
                className={styles.label}
                defaultSelected={isColumnLink}
                onChange={(event) => setIsColumnLink(event.toString())}
              >
                <RadioButton
                  className={styles.radioButton}
                  id="isLinkTrue"
                  labelText={t('true', 'True')}
                  value={true}
                />
                <RadioButton
                  className={styles.radioButton}
                  id="isLinkFalse"
                  labelText={t('false', 'False')}
                  value={false}
                />
              </RadioButtonGroup>
            </FormGroup>
          </Stack>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={handleCreateColumn}>
          <span>{t('createSubMenu', 'Create Submenu')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default ConfigureDashboardModal;
