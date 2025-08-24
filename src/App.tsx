import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CustomerManagement } from './components/CustomerManagement';
import { MessageCenter } from './components/MessageCenter';
import { ServiceReviews } from './components/ServiceReviews';
import { NotificationSettings } from './components/NotificationSettings';
import { FilterManagement } from './components/FilterManagement';

export type ActiveSection =
  | 'dashboard'
  | 'customers'
  | 'messages'
  | 'filters'
  | 'reviews'
  | 'settings';

function App() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomerManagement />;
      case 'messages':
        return <MessageCenter />;
      case 'filters':
        return <FilterManagement />;
      case 'reviews':
        return <ServiceReviews />;
      case 'settings':
        return <NotificationSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - visible on medium+ screens */}
      <div className="hidden md:block">
        <Header
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Sidebar - visible on small screens only */}
      <div className="md:hidden">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={(section) => {
            setActiveSection(section);
            setIsSidebarOpen(false); // close sidebar on selection
          }}
          isMobile
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Mobile menu toggle button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-sky-500 text-white p-2 rounded-md shadow"
        >
          ☰
        </button>
      </div>

      {/* Main Content */}
      <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        {renderActiveSection()}
      </main>
    </div>
  );
}

export default App;
