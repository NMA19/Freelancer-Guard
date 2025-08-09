
import './App.css'
import FreelancerGuard from './components/FreelancerGuard';
import { AuthProvider } from './contexts/AuthContext';
import { ExperienceProvider } from './contexts/ExperienceContext';

function App() {
  return (
    <AuthProvider>
      <ExperienceProvider>
        <FreelancerGuard />
      </ExperienceProvider>
    </AuthProvider>
  )
}

export default App
