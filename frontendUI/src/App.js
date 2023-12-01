import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigator from './Components/Navigator';

import HomeInterface from './Components/HomeInterface';
import ChatInterface from './Components/ChatInterface';
import KnowledgeInterface from './Components/KnowledgeInterface';
import FilesInterface from './Components/FilesInterface';
import ProcessesInterface from './Components/ProcessesInterface';
import ToolsInterface from './Components/ToolsInterface';
import SettingsInterface from './Components/SettingsInterface';
import AboutInterface from './Components/AboutInterface';
import ContactInterface from './Components/ContactInterface';

function App() {
  return (
    <div className="App">
      <Router>
        <Navigator />
        <Routes>
          <Route exact path="/" element={<HomeInterface />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/knowledge" element={<KnowledgeInterface />} />
          <Route path="/files" element={<FilesInterface />} />
          <Route path="/process" element={<ProcessesInterface />} />
          <Route path="/tools" element={<ToolsInterface />} />
          <Route path="/settings" element={<SettingsInterface />} />
          <Route path="/about" element={<AboutInterface />} />
          <Route path="/contact" element={<ContactInterface />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
