import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import Address from "./pages/Address/Address";
import Collage from "./pages/Collage/Collage";
function App() {
  return (
    <Router>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/collage' element={<Collage/>} />
          <Route path='/address/:address' element={<Address />} />
        </Routes>
      </Router>
  );
}

export default App;
