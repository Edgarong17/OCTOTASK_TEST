import React from 'react';
import { FaHome, FaFile, FaChartBar, FaBell, FaUsers, FaUser} from "react-icons/fa";
import './sideMenu.css';

function SideMenu({ children, currentView, onNavigate }) {
  const content = children;

  return (
    <div>
        <div className='side-menu'>
            <div className='side-menu-header'>
                <div className='logo-symbol' />
                <h1 className='header-text'><span className='headerTextOcto'>OCTO</span>Task</h1>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2%' }}>
                <div style={{height:'15vh'}}></div>
                <button className={currentView === 'home' ? 'item-container-selected' : 'item-container'} onClick={() => onNavigate('home')}>
                    <FaHome color='white' size={20} />
                    <h3 className={currentView === 'home' ? 'item-text-selected' : 'item-text'}>Home</h3>
                </button>
                <button className={currentView === 'taskDashboard' ? 'item-container-selected' : 'item-container'} onClick={() => onNavigate('taskDashboard')}>
                    <FaFile color='white' size={20} />
                    <h3 className={currentView === 'taskDashboard' ? 'item-text-selected' : 'item-text'}>Task Dashboard</h3>
                </button>
                <button className={currentView === 'analytics' ? 'item-container-selected' : 'item-container'} onClick={() => onNavigate('analytics')}>
                    <FaChartBar color='white' size={20} />
                    <h3 className={currentView === 'analytics' ? 'item-text-selected' : 'item-text'}>Analytics</h3>
                </button>
                <button className={currentView === 'notifications' ? 'item-container-selected' : 'item-container'} onClick={() => onNavigate('notifications')}>
                    <FaBell color='white' size={20} />
                    <h3 className={currentView === 'notifications' ? 'item-text-selected' : 'item-text'}>Notifications</h3>
                </button>
                <button className={currentView === 'team' ? 'item-container-selected' : 'item-container'} onClick={() => onNavigate('team')}>
                    <FaUsers color='white' size={20} />
                    <h3 className={currentView === 'team' ? 'item-text-selected' : 'item-text'}>Team</h3>
                </button>
                <button className={currentView === 'profile' ? 'item-container-selected' : 'item-container'} onClick={() => onNavigate('profile')}>
                    <FaUser color='white' size={20} />
                    <h3 className={currentView === 'profile' ? 'item-text-selected' : 'item-text'}>Profile</h3>
                </button>
            </div>
        </div>
        <div className="page-content">{content}</div>
    </div>
  );
}

export default SideMenu;
