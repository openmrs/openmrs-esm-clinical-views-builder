import React, { useState } from 'react';
import styles from './view-editor.scss';
import classNames from 'classnames';
import { Column, Grid, IconButton } from '@carbon/react';
import { type TFunction, useTranslation } from 'react-i18next';
import { ArrowLeft, Maximize, Minimize } from '@carbon/react/icons';
import Header from '../header/header.component';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';

interface TranslationFnProps {
  t: TFunction;
}

const ContentPackagesEditorContent: React.FC<TranslationFnProps> = ({ t }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const responsiveSize = isMaximized ? 16 : 8;
  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };
  const defaultEnterDelayInMs = 300;

  return (
    <div className={styles.container}>
      <Grid
        className={classNames(styles.grid as string, {
          [styles.maximized]: isMaximized,
        })}
      >
        <Column lg={responsiveSize} md={responsiveSize} className={styles.column}>
          <div className={styles.heading}>
            <span className={styles.tabHeading}>{t('schemaEditor', 'Schema editor')}</span>
          </div>
          <>
            <IconButton
              enterDelayInMs={defaultEnterDelayInMs}
              kind="ghost"
              label={isMaximized ? t('minimizeEditor', 'Minimize editor') : t('maximizeEditor', 'Maximize editor')}
              onClick={handleToggleMaximize}
              size="md"
            >
              {isMaximized ? <Minimize /> : <Maximize />}
            </IconButton>
          </>
          <div className={styles.editorContainer}>Content of json</div>
        </Column>
        <Column lg={8} md={8} className={styles.column}>
          <div className={styles.editorContainer}>Content of preview</div>
        </Column>
      </Grid>
    </div>
  );
};

function BackButton({ t }: TranslationFnProps) {
  return (
    <div className={styles.backButton}>
      <ConfigurableLink to={window.getOpenmrsSpaBase() + 'content-packages-builder'}>
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeft size={24} {...props} />}
          iconDescription="Return to dashboard"
        >
          <span>{t('backToDashboard', 'Back to dashboard')}</span>
        </Button>
      </ConfigurableLink>
    </div>
  );
}

function ClinicalViewsEditor() {
  const { t } = useTranslation();

  return (
    <>
      <Header title={t('schemaEditor', 'Schema editor')} />
      <BackButton t={t} />
      <ContentPackagesEditorContent t={t} />
    </>
  );
}

export default ClinicalViewsEditor;
