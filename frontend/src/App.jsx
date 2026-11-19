import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';

function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
