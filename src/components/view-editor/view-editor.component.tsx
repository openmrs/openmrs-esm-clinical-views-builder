import React, { useState, useCallback, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { useParams, useLocation } from 'react-router-dom';
import { Column, CopyButton, Grid, IconButton, Button, FileUploader } from '@carbon/react';
import { type TFunction, useTranslation } from 'react-i18next';
import { ArrowLeft, Maximize, Minimize, Download } from '@carbon/react/icons';
import Header from '../header/header.component';
import { type ConfigObject, ConfigurableLink, showSnackbar, useConfig } from '@openmrs/esm-framework';
import SchemaEditor from '../schema-editor/schema-editor.component';
import InteractiveBuilder from '../interactive-builder/interactive-builder.component';
import { type Schema } from '../../types';

import styles from './view-editor.scss';

interface TranslationFnProps {
  t: TFunction;
}

const ContentPackagesEditorContent: React.FC<TranslationFnProps> = ({ t }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const [schema, setSchema] = useState<Schema>();
  const [stringifiedSchema, setStringifiedSchema] = useState<string>(schema ? JSON.stringify(schema, null, 2) : '');
  const [isSaving, setIsSaving] = useState(false);

  const { clinicalViewId } = useParams(); // Extract 'id' from the URL
  const location = useLocation(); // To check if it's in 'edit' mode
  const { patientUuid } = useConfig<ConfigObject>();

  useEffect(() => {
    if (clinicalViewId && location.pathname.includes('edit')) {
      loadSchema(clinicalViewId);
    }
  }, [clinicalViewId, location]);

  const loadSchema = (id: string) => {
    const savedSchema = localStorage.getItem(id);
    if (savedSchema) {
      const parsedSchema: Schema = JSON.parse(savedSchema);
      setSchema(parsedSchema);
      setStringifiedSchema(JSON.stringify(parsedSchema, null, 2));
    }
  };

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleSchemaChange = useCallback((updatedSchema: string) => {
    setStringifiedSchema(updatedSchema);
  }, []);

  const updateSchema = useCallback((updatedSchema: Schema) => {
    setSchema(updatedSchema);
    const stringfiedJson: string = JSON.stringify(updatedSchema, null, 2);
    setStringifiedSchema(stringfiedJson);
  }, []);

  const renderSchemaChanges = useCallback(() => {
    if (!stringifiedSchema) {
      showSnackbar({
        title: t('errorRendering', 'Error rendering'),
        kind: 'error',
        subtitle: t('renderingErrorMessage', 'There was an error rendering the clinical view'),
      });
      return;
    }
    const parsedJson: Schema = JSON.parse(stringifiedSchema);
    updateSchema(parsedJson);
    setStringifiedSchema(JSON.stringify(parsedJson, null, 2));
  }, [stringifiedSchema, updateSchema, t]);

  const inputDummySchema = useCallback(() => {
    const dummySchema: Schema = {
      id: 'unique-schema-id-1',
      '@openmrs/esm-patient-chart-app': {
        extensionSlots: {
          'patient-chart-dashboard-slot': {
            add: ['nav-group#testPackage'],
            configure: {
              'nav-group#testPackage': {
                title: 'Package One',
                slotName: 'package-one-slot',
                isExpanded: true,
              },
            },
          },
          'package-one-slot': {
            add: ['dashboard#menuOne', 'dashboard#menuTwo'],
            configure: {
              'dashboard#menuOne': {
                title: 'First Menu',
                slot: 'first-menu-slot',
                path: 'first-menu-path',
              },
              'dashboard#menuTwo': {
                title: 'Second Menu',
                slot: 'second-menu-slot',
                path: 'second-menu-path',
              },
            },
          },
        },
      },
    };

    setStringifiedSchema(JSON.stringify(dummySchema, null, 2));
    updateSchema({ ...dummySchema });
  }, [updateSchema]);

  const handleSchemaImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const fileContent: string = result;
        const parsedJson: Schema = JSON.parse(fileContent);
        setSchema(parsedJson);
      } else if (result instanceof ArrayBuffer) {
        const decoder = new TextDecoder();
        const fileContent: string = decoder.decode(result);
        const parsedJson: Schema = JSON.parse(fileContent);
        setSchema(parsedJson);
      }
    };

    reader.readAsText(file);
  };

  const downloadableSchema = useMemo(
    () =>
      new Blob([JSON.stringify(schema, null, 2)], {
        type: 'application/json',
      }),
    [schema],
  );

  const handleCopySchema = useCallback(async () => {
    await navigator.clipboard.writeText(stringifiedSchema);
  }, [stringifiedSchema]);

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
    return '';
  };

  const handleSavePackage = () => {
    setIsSaving(true);
    const schemaId = Object.keys(schema)?.[0];
    if (schema && schemaId) {
      const existingSchema = localStorage.getItem(schemaId);
      if (existingSchema) {
        // If it exists, update the schema
        localStorage.setItem(schemaId, JSON.stringify(schema));
        showSnackbar({
          title: t('clinicalViewUpdated', 'Clinical view updated'),
          kind: 'success',
          subtitle: t('updateSuccessMessage', 'Clinical view updated successfully'),
        });
        setIsSaving(false);
      } else {
        localStorage.setItem(schemaId, JSON.stringify(schema));
        showSnackbar({
          title: t('clinicalViewCreated', 'Clinical view saved'),
          kind: 'success',
          subtitle: t('creationSuccessMessage', 'Clinical view saved successfully'),
        });
        setIsSaving(false);
      }
    } else {
      setIsSaving(false);
      showSnackbar({
        title: t('errorSaving', 'Error saving'),
        kind: 'error',
        subtitle: t('savingErrorMessage', 'There was an error saving a clinical view'),
      });
    }
  };

  const handlePreviewPackage = () => {
    window.open(window.getOpenmrsSpaBase() + `patient/${patientUuid}/chart/Patient%20Summary`);
  };

  const navGroupTitle = getNavGroupTitle(schema);
  const sanitizedTitle = navGroupTitle?.replace(/\s+/g, '_');

  const responsiveSize = isMaximized ? 16 : 8;
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
            <div className={styles.topBtns}>
              {!schema ? (
                <FileUploader
                  onChange={handleSchemaImport}
                  labelTitle=""
                  labelDescription=""
                  buttonLabel={t('importSchema', 'Import schema')}
                  buttonKind="ghost"
                  size="lg"
                  filenameStatus="edit"
                  accept={['.json']}
                  multiple={false}
                  disabled={false}
                  iconDescription={t('importSchema', 'Import schema')}
                  name="form-import"
                />
              ) : null}
              {!schema ? (
                <Button kind="ghost" onClick={inputDummySchema}>
                  {t('inputDummySchema', 'Input dummy schema')}
                </Button>
              ) : null}
              <Button kind="ghost" onClick={renderSchemaChanges}>
                <span>{t('renderChanges', 'Render changes')}</span>
              </Button>
            </div>
            {schema ? (
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
                <CopyButton
                  align="top"
                  className="cds--btn--md"
                  enterDelayInMs={defaultEnterDelayInMs}
                  iconDescription={t('copySchema', 'Copy schema')}
                  kind="ghost"
                  onClick={handleCopySchema}
                />
                <a download={`${sanitizedTitle}.json`} href={window.URL.createObjectURL(downloadableSchema)}>
                  <IconButton
                    enterDelayInMs={defaultEnterDelayInMs}
                    kind="ghost"
                    label={t('downloadSchema', 'Download schema')}
                    size="md"
                  >
                    <Download />
                  </IconButton>
                </a>
              </>
            ) : null}
          </div>
          <div className={styles.editorContainer}>
            <SchemaEditor stringifiedSchema={stringifiedSchema} onSchemaChange={handleSchemaChange} />
          </div>
        </Column>
        <Column lg={8} md={8} className={styles.column}>
          <div className={styles.heading}>
            <span className={styles.tabHeading}>{t('interactiveBuilder', 'Interactive Builder')}</span>
            <div className={styles.topBtns}>
              <Button disabled={!navGroupTitle || isSaving} onClick={handleSavePackage}>
                {schema && clinicalViewId
                  ? t('updateSchema', 'Update Schema')
                  : t('saveClinicalView', 'Save clinical view')}
              </Button>
              <Button disabled={!navGroupTitle || isSaving} onClick={handlePreviewPackage}>
                {schema && t('previewClinicalView', 'Preview clinical view')}
              </Button>
            </div>
          </div>

          <div className={styles.editorContainer}>
            <InteractiveBuilder schema={schema} onSchemaChange={updateSchema} />
          </div>
        </Column>
      </Grid>
    </div>
  );
};

function BackButton({ t }: TranslationFnProps) {
  return (
    <div className={styles.backButton}>
      <ConfigurableLink to={window.getOpenmrsSpaBase() + 'clinical-views-builder'}>
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
