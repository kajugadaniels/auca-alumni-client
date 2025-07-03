import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- layout ---------- */
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";

/* ---------- pages ---------- */
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Directory from "./pages/Directory";
import Events from "./pages/Events";
import News from "./pages/News";
import Mentorship from "./pages/Mentorship";
import JobBoard from "./pages/JobBoard";
import Forums from "./pages/Forums";
import Donation from "./pages/Donation";
import AlumniStories from "./pages/AlumniStories";
import GlobalChapters from "./pages/GlobalChapters";
import Profile from "./pages/Profile";
import LearningCenter from "./pages/LearningCenter";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

/* ---------- event sub-routes ---------- */
import AddEvent from "./components/pages/events/AddEvent";
import EventDetails from "./components/pages/events/EventDetails";
import EditEvent from "./components/pages/events/EditEvent";
import AddNews from "./components/pages/news/AddNews";
import NewsDetails from "./components/pages/news/NewsDetails";
import EditNews from "./components/pages/news/EditNews";
import AddProgram from "./components/pages/programs/AddProgram";
import EditProgram from "./components/pages/programs/EditProgram";
import ProgramDetails from "./components/pages/programs/ProgramDetails";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* ----- sidebar toggle ----- */
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  /* ----- auth flags (simple demo) ----- */
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* GLOBAL TOASTS */}
        <ToastContainer autoClose={4000} hideProgressBar newestOnTop />

        {/* SIDEBAR + NAV + ROUTES */}
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          isLoggedIn={isLoggedIn}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar
            toggleSidebar={toggleSidebar}
            isLoggedIn={isLoggedIn}
            handleLogout={handleLogout}
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/directory" element={<Directory />} />

              {/* events */}
              <Route path="/events" element={<Events />} />
              <Route path="/events/add" element={<AddEvent />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/events/:id/edit" element={<EditEvent />} />

              {/* misc */}
              <Route path="/news" element={<News />} />
              <Route path="/news/add" element={<AddNews />} />
              <Route path="/news/:id" element={<NewsDetails />} />
              <Route path="/news/:id/edit" element={<EditNews />} />

              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/programs/add" element={<AddProgram />} />
              <Route path="/programs/:id" element={<EditProgram />} />
              <Route path="/programs/:id/edit" element={<ProgramDetails />} />

              <Route path="/jobs" element={<JobBoard />} />
              <Route path="/forums" element={<Forums />} />
              <Route path="/donate" element={<Donation />} />
              <Route path="/stories" element={<AlumniStories />} />
              <Route path="/chapters" element={<GlobalChapters />} />
              <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} />} />
              <Route path="/learning" element={<LearningCenter />} />
              <Route path="/login" element={<Login handleLogin={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
