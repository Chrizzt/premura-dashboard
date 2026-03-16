import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Trophy,
  CalendarDays,
  Settings,
  ChevronLeft,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/clients', label: 'Client View', icon: Building2 },
  { path: '/agents', label: 'Agent View', icon: Users },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/historical', label: 'Historical', icon: CalendarDays },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
      style={{
        backgroundColor: '#16213e',
        borderRight: '1px solid rgba(0,212,255,0.1)',
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        {!collapsed && (
          <span
            className="text-xl font-bold tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #7b2ff7, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Premura
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-secondary transition-colors"
        >
          <ChevronLeft
            size={18}
            className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                active ? 'text-white' : 'text-secondary hover:text-primary hover:bg-white/5'
              }`}
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg, rgba(123,47,247,0.25), rgba(0,212,255,0.15))',
                      boxShadow: '0 0 12px rgba(0,212,255,0.15)',
                    }
                  : undefined
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={20}
                style={active ? { color: '#00d4ff' } : undefined}
              />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
