
import React, { useState, useEffect } from 'react';
import { View, StudentInfo, BuildingResult, LeaderboardEntry } from './types';
import LoginView from './components/LoginView';
import BuilderView from './components/BuilderView';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('LOGIN');
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [buildingResult, setBuildingResult] = useState<BuildingResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('atom_leaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  const handleLogin = (info: StudentInfo) => {
    setStudent(info);
    setCurrentView('BUILDER');
  };

  const handleFinish = (result: BuildingResult) => {
    setBuildingResult(result);
    if (student) {
      const newEntry: LeaderboardEntry = {
        ...result,
        student_name: student.student_name,
        group: student.group,
        date: new Date().toLocaleDateString('vi-VN')
      };
      const updated = [newEntry, ...leaderboard].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeTaken - b.timeTaken;
      }).slice(0, 10);
      setLeaderboard(updated);
      localStorage.setItem('atom_leaderboard', JSON.stringify(updated));
    }
    setCurrentView('RESULTS');
  };

  const handleRestart = () => {
    setCurrentView('BUILDER');
  };

  const handleLogout = () => {
    setStudent(null);
    setBuildingResult(null);
    setCurrentView('LOGIN');
  };

  return (
    <div className="min-h-screen w-full selection:bg-indigo-100 selection:text-indigo-900">
      {currentView === 'LOGIN' && (
        <LoginView onLogin={handleLogin} leaderboard={leaderboard} />
      )}
      {currentView === 'BUILDER' && student && (
        <BuilderView 
          student={student} 
          onFinish={handleFinish} 
          onLogout={handleLogout} 
        />
      )}
      {currentView === 'RESULTS' && student && buildingResult && (
        <ResultsView 
          student={student} 
          result={buildingResult} 
          onRestart={handleRestart} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default App;
