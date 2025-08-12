import React, { createContext, useContext, useReducer, useCallback } from 'react';
// import apiService from '../services/api';

// Initial state
const initialState = {
  experiences: [],
  currentExperience: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    category: '',
    rating: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  },
};

// Action types
const EXPERIENCE_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  FETCH_SINGLE_SUCCESS: 'FETCH_SINGLE_SUCCESS',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  VOTE_SUCCESS: 'VOTE_SUCCESS',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_EXPERIENCES: 'RESET_EXPERIENCES',
};

// Reducer
const experienceReducer = (state, action) => {
  switch (action.type) {
    case EXPERIENCE_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case EXPERIENCE_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        experiences: action.payload.experiences,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };

    case EXPERIENCE_ACTIONS.FETCH_SINGLE_SUCCESS:
      return {
        ...state,
        currentExperience: action.payload,
        loading: false,
        error: null,
      };

    case EXPERIENCE_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case EXPERIENCE_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        experiences: [action.payload, ...state.experiences],
      };

    case EXPERIENCE_ACTIONS.VOTE_SUCCESS:
      return {
        ...state,
        experiences: state.experiences.map(exp =>
          exp.id === action.payload.id ? action.payload : exp
        ),
        currentExperience: state.currentExperience?.id === action.payload.id
          ? action.payload
          : state.currentExperience,
      };

    case EXPERIENCE_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case EXPERIENCE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case EXPERIENCE_ACTIONS.RESET_EXPERIENCES:
      return {
        ...state,
        experiences: [],
        currentExperience: null,
        pagination: initialState.pagination,
      };

    default:
      return state;
  }
};

// Create context
const ExperienceContext = createContext();

// Provider component
export const ExperienceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(experienceReducer, initialState);

  // Fetch experiences
  const fetchExperiences = useCallback(async (params = {}) => {
    dispatch({ type: EXPERIENCE_ACTIONS.FETCH_START });
    try {
      const queryParams = { ...state.filters, ...params };
      const response = await experiencesAPI.getAll(queryParams);
      dispatch({
        type: EXPERIENCE_ACTIONS.FETCH_SUCCESS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch experiences';
      dispatch({
        type: EXPERIENCE_ACTIONS.FETCH_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, [state.filters]);

  // Fetch single experience
  const fetchExperience = useCallback(async (id) => {
    dispatch({ type: EXPERIENCE_ACTIONS.FETCH_START });
    try {
      const response = await experiencesAPI.getById(id);
      dispatch({
        type: EXPERIENCE_ACTIONS.FETCH_SINGLE_SUCCESS,
        payload: response.data.experience,
      });
      return { success: true, data: response.data.experience };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch experience';
      dispatch({
        type: EXPERIENCE_ACTIONS.FETCH_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Create experience
  const createExperience = useCallback(async (experienceData) => {
    try {
      const response = await experiencesAPI.create(experienceData);
      // Refresh experiences list
      await fetchExperiences();
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create experience';
      return { success: false, error: errorMessage };
    }
  }, [fetchExperiences]);

  // Vote on experience
  const voteExperience = useCallback(async (id, voteType) => {
    try {
      await experiencesAPI.vote(id, voteType);
      // Refresh the specific experience or all experiences
      await fetchExperiences();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to vote';
      return { success: false, error: errorMessage };
    }
  }, [fetchExperiences]);

  // Set filters
  const setFilters = useCallback((newFilters) => {
    dispatch({
      type: EXPERIENCE_ACTIONS.SET_FILTERS,
      payload: newFilters,
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: EXPERIENCE_ACTIONS.CLEAR_ERROR });
  }, []);

  // Reset experiences
  const resetExperiences = useCallback(() => {
    dispatch({ type: EXPERIENCE_ACTIONS.RESET_EXPERIENCES });
  }, []);

  const value = {
    ...state,
    fetchExperiences,
    fetchExperience,
    createExperience,
    voteExperience,
    setFilters,
    clearError,
    resetExperiences,
  };

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
};

// Custom hook
export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
};

export default ExperienceContext;
