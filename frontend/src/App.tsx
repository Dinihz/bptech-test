import { BrowserRouter,Routes, Route} from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { Navbar } from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
    <Navbar />

    <div className='p-8'>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/' element={<LoginPage />} />
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App
