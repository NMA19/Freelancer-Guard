import React, { createContext, useContext, useState } from 'react';

// Simple Experience Context - placeholder to avoid import errors
const ExperienceContext = createContext();

export const ExperienceProvider = ({ children }) => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);

  const createExperience = async (experienceData) => {
    // Simple implementation
    const newExperience = { ...experienceData, id: Date.now() };
    setExperiences(prev => [newExperience, ...prev]);
    return newExperience;
  };

  const value = {
    experiences,
    loading,
    createExperience
  };

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (!context) {
    // Return mock values to avoid errors
    return {
      experiences: [],
      loading: false,
      createExperience: async () => ({})
    };
  }
  return context;
};

export default ExperienceContext;
