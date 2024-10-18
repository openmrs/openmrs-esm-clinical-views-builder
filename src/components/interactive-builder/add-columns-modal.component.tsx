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
  DefinitionTypes,
} from '../../types';
import styles from './modals.scss';
import { useForms } from '../../hooks/useForm';
import { useFormConcepts } from '../../hooks/useFormConcepts';
import { generateNodeId } from '../../helpers';
import { useEncounterTypes } from '../../hooks/useEncounter';

interface ConfigureDashboardModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  closeModal: () => void;
  slotDetails: DashboardConfig;
  tabDefinition: TabDefinition;
  definitionType: DefinitionTypes;
}

const ConfigureDashboardModal: React.FC<ConfigureDashboardModalProps> = ({
  schema,
  onSchemaChange,
  closeModal,
  slotDetails,
  tabDefinition,
  definitionType,
}) => {
  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());
  const [columnTitle, setColumnTitle] = useState('');
  const [columnConcept, setColumnConcept] = useState('');
  const [isColumnDate, setIsColumnDate] = useState(false);
  const [isColumnLink, setIsColumnLink] = useState(false);
  const [encounterType, setEncounterType] = useState('');
  const [selectedForm, setSelectedForm] = useState<FormType>();
  const { isLoadingForm, forms, formsError } = useForms();
  const { isLoadingFormConcepts, formConcepts, formConceptsError, mutate } = useFormConcepts(selectedForm);
  const { isLoading, encounterTypes, encounterTypesError } = useEncounterTypes();
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
                  [definitionType]: schemaBasePath.extensionSlots[slotDetails?.slot]?.configure[slotDetails?.slot]?.[
                    definitionType
                  ]?.map((def) => {
                    if (def.tabName === tabDefinition.tabName) {
                      return {
                        ...def,
                        columns: [...(def.columns || []), newColumns],
                      };
                    }
                    return def;
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
      setEncounterType('');
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
    const baseColumn = {
      id: generateNodeId(columnTitle),
      title: columnTitle,
      concept: columnConcept,
      isDate: isColumnDate,
    };

    const newColumn = {
      ...baseColumn,
      ...(definitionType === DefinitionTypes.TAB_DEFINITION
        ? { isLink: isColumnLink }
        : { encounterType: encounterType, hasSummary: false, conceptMappings: [] }),
    };

    updateSchema(newColumn);
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
                {!encounterType && <SelectItem text={t('selectEncounterType', 'Select an encounter type')} value="" />}
                {encounterTypes.length === 0 ||
                  (encounterTypesError && (
                    <SelectItem text={t('noEncounterTypesAvailable', 'No encounter types available')} value="" />
                  ))}
                {encounterTypes?.length > 0 &&
                  encounterTypes.map((encounterType) => (
                    <SelectItem key={encounterType.uuid} text={encounterType.display} value={encounterType.display}>
                      {encounterType.display}
                    </SelectItem>
                  ))}
              </Select>
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
                {!columnConcept && <SelectItem text={t('selectConcept', 'Select a concept')} value="" />}
                {formConcepts.length === 0 ||
                  (formConceptsError && (
                    <SelectItem text={t('noConceptsAvailable', 'No concepts available')} value="" />
                  ))}
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
                defaultSelected={isColumnDate ? 'true' : 'false'} // Cast boolean to string
                onChange={(value) => setIsColumnDate(value === 'true')} // Convert string back to boolean
              >
                <RadioButton
                  className={styles.radioButton}
                  id="isDateTrue"
                  labelText={t('true', 'True')}
                  value="true" // Value as string
                />
                <RadioButton
                  className={styles.radioButton}
                  id="isDateFalse"
                  labelText={t('false', 'False')}
                  value="false" // Value as string
                />
              </RadioButtonGroup>

              <RadioButtonGroup
                name="isLink"
                orientation="horizontal"
                legendText={t('isLink', 'Is link')}
                className={styles.label}
                defaultSelected={isColumnLink ? 'true' : 'false'} // Cast boolean to string
                onChange={(value) => setIsColumnLink(value === 'true')} // Convert string back to boolean
              >
                <RadioButton
                  className={styles.radioButton}
                  id="isLinkTrue"
                  labelText={t('true', 'True')}
                  value="true" // Value as string
                />
                <RadioButton
                  className={styles.radioButton}
                  id="isLinkFalse"
                  labelText={t('false', 'False')}
                  value="false" // Value as string
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
