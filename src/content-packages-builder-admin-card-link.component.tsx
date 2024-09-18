import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, ClickableTile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';

const FormBuilderCardLink: React.FC = () => {
  const { t } = useTranslation();
  const header = t('manageClinicalViews', 'Manage clinical views');
  return (
    <Layer>
      <ClickableTile href={`${window.spaBase}/clinical-views-builder`} target="_blank" rel="noopener noreferrer">
        <div>
          <div className="heading">{header}</div>
          <div className="content">{t('clinicalViewsBuilder', 'Clinical Views builder')}</div>
        </div>
        <div className="iconWrapper">
          <ArrowRight size={16} />
        </div>
      </ClickableTile>
    </Layer>
  );
};

export default FormBuilderCardLink;
