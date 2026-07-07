import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import EntryPage from "./pages/EntryPage";
import CatalogPage from "./pages/CatalogPage";
import StatsPage from "./pages/StatsPage";
import NetworkPage from "./pages/NetworkPage";
import AnalyzePage from "./pages/AnalyzePage";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/birlik/:id" element={<EntryPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/statistika" element={<StatsPage />} />
          <Route path="/tarmoq" element={<NetworkPage />} />
          <Route path="/tahlil" element={<AnalyzePage />} />
          <Route path="/haqida" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="*"
            element={
              <p className="py-16 text-center text-sub">Sahifa topilmadi.</p>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
