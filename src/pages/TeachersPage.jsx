import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { InputMarks } from '../components/teachers/InputMarks';
import { MarkAttendance } from '../components/teachers/MarkAttendance';
import { StudentProgress } from '../components/teachers/StudentProgress';
import { StaffAttendance } from '../components/teachers/StaffAttendance';
import { RecheckingSchedule } from '../components/teachers/RecheckingSchedule';

export const TeachersPage = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('marks');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <LoadingSpinner />;
  }

  console.log(user);

  const isSubjectTeacher = hasRole('Subject Teacher');
  const isClassTeacher = hasRole('Class Teacher');
  const isSuperAdmin = hasRole('Super Admin');

  // Determine available tabs based on role
  const getAvailableTabs = () => {
    const tabs = [
      { id: 'marks', label: 'Input Marks', icon: '📝' },
      { id: 'rechecking', label: 'Rechecking Schedule', icon: '📋' },
      { id: 'staff-attendance', label: 'My Attendance', icon: '⏰' }
    ];

    if (isClassTeacher || isSuperAdmin) {
      tabs.push(
        { id: 'attendance', label: 'Student Attendance', icon: '👥' },
        { id: 'progress', label: 'Student Progress', icon: '📊' }
      );
    }

    return tabs;
  };

  const availableTabs = getAvailableTabs();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'marks':
        return <InputMarks />;
      case 'rechecking':
        return <RecheckingSchedule />;
      case 'attendance':
        return <MarkAttendance />;
      case 'progress':
        return <StudentProgress />;
      case 'staff-attendance':
        return <StaffAttendance />;
      default:
        return <InputMarks />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user.full_name}! 
          {isSubjectTeacher && !isClassTeacher && " You are a Subject Teacher."}
          {isClassTeacher && " You are a Class Teacher with additional responsibilities."}
        </p>
      </div>

      {/* Role Information */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Your Roles:</h3>
        <div className="flex flex-wrap gap-2">
          {
          user.roles?.map(role => (
            <span key={role} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6">
            {renderTabContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersPage; 