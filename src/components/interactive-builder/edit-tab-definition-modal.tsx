import React, { useState } from 'react';
import { Modal, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';

const EditTabDefinitionModal = ({ tabDefinition, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [tabName, setTabName] = useState(tabDefinition?.tabName ?? '');
  const [headerTitle, setHeaderTitle] = useState(tabDefinition?.headerTitle ?? '');

  const handleSave = () => {
    const updatedTabDefinition = {
      ...tabDefinition,
      tabName,
      headerTitle,
    };
    onSave(updatedTabDefinition);
  };

  return (
    <Modal
      open={true}
      modalHeading={t('editTabDefinition', 'Edit Tab Definition')}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSave}
      onRequestClose={onCancel}
    >
      <form>
        <TextInput
          id="tabName"
          labelText={t('tabName', 'Tab Name')}
          value={tabName}
          onChange={(e) => setTabName(e.target.value)}
        />
        <TextInput
          id="headerTitle"
          labelText={t('headerTitle', 'Header Title')}
          value={headerTitle}
          onChange={(e) => setHeaderTitle(e.target.value)}
        />
      </form>
    </Modal>
  );
};

export default EditTabDefinitionModal;
