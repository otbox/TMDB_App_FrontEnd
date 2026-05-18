import { Route, Routes } from "react-router-dom"
import Layout from "./components/Layout/Layout"
import Home from "./pages/Home"
import RatedMovies from "./pages/RatedMovies"


function App() {

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />}/>
         <Route path="/rated" element={<RatedMovies />} />
      </Route>
    </Routes>
  )
}

export default App
