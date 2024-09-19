import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Dashboard from './components/dashboard/dashboard.component';
import ClinicalViewsEditor from './components/view-editor/view-editor.component';

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/clinical-views-builder`}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<ClinicalViewsEditor />} />
        <Route path="/edit/:contentPackage" element={<ClinicalViewsEditor />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
