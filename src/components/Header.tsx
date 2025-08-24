import React from 'react';
import {
  Droplets,
  Users,
  MessageSquare,
  Filter,
  Star,
  Settings,
  BarChart3,
} from 'lucide-react';
import { ActiveSection } from '../App';

interface HeaderProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
}

export function Header({ activeSection, setActiveSection }: HeaderProps) {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'filters', label: 'Filter Management', icon: Filter },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-sky-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Dada Aro Care
                </h1>
                <p className="text-xs text-gray-500">
                  Customer Service Platform
                </p>
              </div>
            </div>
          </div>

          {/* Navigation - only on md and up */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as ActiveSection)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
      </div>
    </header>
  );
}
