import React from 'react';
import {
  Droplets,
  Users,
  MessageSquare,
  Filter,
  Star,
  Settings,
  BarChart3,
  X,
} from 'lucide-react';
import { ActiveSection } from '../App';

interface SidebarProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  activeSection,
  setActiveSection,
  isMobile = false,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'filters', label: 'Filter Management', icon: Filter },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const containerClasses = isMobile
    ? `fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : `fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-50 hidden md:flex flex-col`;

  return (
    <aside className={containerClasses}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Droplets className="h-8 w-8 text-sky-500" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dada Aro Care</h1>
              <p className="text-xs text-gray-500">Customer Service Platform</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as ActiveSection)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === id
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
