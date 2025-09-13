import { BrowserRouter,Routes, Route} from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
    <Navbar />

    <div className='p-8'>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/' element={<LoginPage />} />

          <Route element={<ProtectedRoute />} />
          <Route path='/dashboard' element={<DashboardPage />} />
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App
