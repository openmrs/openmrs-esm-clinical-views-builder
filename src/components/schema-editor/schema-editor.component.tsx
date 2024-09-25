import React, { useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/ext-language_tools';

interface InteractiveBuilderProps {
  onSchemaChange: (updatedSchema: string) => void;
  stringifiedSchema: string;
}

const SchemaEditor = ({ stringifiedSchema, onSchemaChange }: InteractiveBuilderProps) => {
  const handleEditorChange = (newValue: string) => {
    onSchemaChange(newValue);
  };

  return (
    <AceEditor
      style={{ height: '100vh', width: '100%' }}
      mode="json"
      theme="textmate"
      name="schemaEditor"
      value={stringifiedSchema}
      onChange={handleEditorChange}
      fontSize={15}
      showPrintMargin={false}
      showGutter={true}
      highlightActiveLine={true}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        displayIndentGuides: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  );
};

export default SchemaEditor;
