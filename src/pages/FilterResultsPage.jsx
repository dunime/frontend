import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

// Helper function to load data from local storage
const loadFromLocalStorage = (key) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading state from local storage:", error);
    return undefined;
  }
};

// Helper function to save data to local storage
const saveToLocalStorage = (key, value) => {
  try {
    const serializedState = JSON.stringify(value);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.error("Error saving state to local storage:", error);
  }
};

// Genres List
const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", 
  "Fantasy", "Game", "Harem", "Horror", "Isekai", 
  "Shounen", "Mecha", "Music", "Mystery", "Psychological", 
  "Romance", "School", "Sci-fi", "Slice of Life", "Sports", 
  "Supernatural", "Vampire"
];

export default function FilterResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get filter values from URL params
  const typeParam = searchParams.get('type') || 'All';
  const statusParam = searchParams.get('status') || 'All';
  const seasonParam = searchParams.get('season') || 'All';
  const yearParam = searchParams.get('year') || 'All';
  const genreParam = searchParams.get('genre') || '';
  const searchQuery = searchParams.get('q') || '';

  // State Management
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  
  // Filter States
  const [filterType, setFilterType] = useState(typeParam);
  const [filterStatus, setFilterStatus] = useState(statusParam);
  const [filterSeason, setFilterSeason] = useState(seasonParam);
  const [filterYear, setFilterYear] = useState(yearParam);
  const [selectedGenres, setSelectedGenres] = useState(
    genreParam ? genreParam.split(',') : []
  );

  // Results State
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;

  // Generate years for filter dropdown
  const years = Array.from({ length: 2025 - 1917 + 1 }, (_, i) => 2025 - i);

  useEffect(() => {
    fetchResults();
  }, [typeParam, statusParam, seasonParam, yearParam, genreParam, searchQuery, currentPage]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cache key based on filter parameters
      const cacheKey = `animeResults_${typeParam}_${statusParam}_${seasonParam}_${yearParam}_${genreParam}_${searchQuery}_${currentPage}`;
      
      // Check if we have cached results
      const cachedResults = loadFromLocalStorage(cacheKey);
      
      if (cachedResults) {
        setResults(cachedResults.data);
        setTotalResults(cachedResults.total);
        setLoading(false);
        return;
      }
      
      // Build API URL based on filters
      let apiUrl = 'https://api.jikan.moe/v4/anime';
      const params = new URLSearchParams();
      
      // Add page parameter
      params.append('page', currentPage);
      params.append('limit', resultsPerPage);
      
      // Add search query if exists
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      
      // Add type filter
      if (typeParam !== 'All') {
        params.append('type', typeParam === 'Series' ? 'TV' : typeParam);
      }
      
      // Add status filter
      if (statusParam !== 'All') {
        params.append('status', statusParam.replace(' ', '_').toLowerCase());
      }
      
      // Add season filter
      if (seasonParam !== 'All') {
        params.append('season', seasonParam.toLowerCase());
      }
      
      // Add year filter
      if (yearParam !== 'All') {
        params.append('year', yearParam);
      }
      
      // Add genres if selected
      if (genreParam) {
        // Would need a genre mapping between genre names and IDs
        // For demonstration, we'll skip this part
        // params.append('genres', genreParam);
      }
      
      // Make the API request
      const response = await axios.get(`${apiUrl}?${params.toString()}`);
      
      // Cache the results
      saveToLocalStorage(cacheKey, {
        data: response.data.data,
        total: response.data.pagination.items.total
      });
      
      setResults(response.data.data);
      setTotalResults(response.data.pagination.items.total);
    } catch (error) {
      console.error("Error fetching filtered anime results:", error);
      setError("Failed to load results. Please try again later.");
      
      // Use sample data as fallback
      const fallbackData = Array(20).fill().map((_, i) => ({
        id: i + 1,
        title: `Anime Title ${i + 1}`,
        images: {
          jpg: {
            image_url: "/api/placeholder/280/400"
          }
        },
        year: 2025 - Math.floor(i / 4),
        season: ["Winter", "Spring", "Summer", "Fall"][i % 4],
        status: i % 3 === 0 ? "Finished Airing" : i % 3 === 1 ? "Currently Airing" : "Not Yet Aired",
        genres: [{ name: genres[i % genres.length] }]
      }));
      
      setResults(fallbackData);
      setTotalResults(100);
    } finally {
      setLoading(false);
    }
  };

  const toggleSideMenu = () => {
    setSideMenuOpen(!sideMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const toggleShowMoreGenres = () => {
    setShowMoreGenres(!showMoreGenres);
  };

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (filterType !== 'All') params.set('type', filterType);
    if (filterStatus !== 'All') params.set('status', filterStatus);
    if (filterSeason !== 'All') params.set('season', filterSeason);
    if (filterYear !== 'All') params.set('year', filterYear);
    if (selectedGenres.length > 0) params.set('genre', selectedGenres.join(','));
    if (searchTerm) params.set('q', searchTerm);
    
    navigate(`/filter?${params.toString()}`);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalResults / resultsPerPage)) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 to-pink-800 shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSideMenu} className="text-white">
              <Menu size={24} />
            </button>
            <a href="#" onClick={() => navigate('/')} className="flex items-center">
              <img src="/api/placeholder/32/32" alt="Dunime Logo" className="w-8 h-8 rounded-full" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
                Dunime
              </span>
            </a>
          </div>

          <button onClick={toggleSearch} className="text-white">
            <Search size={24} />
          </button>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="mt-4 flex items-center">
            <input
              type="text"
              placeholder="Search anime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow p-2 rounded-l-md bg-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={toggleFilter}
              type="button"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
            >
              Filter
            </button>
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-r-md"
            >
              Search
            </button>
          </form>
        )}
      </header>

      {/* Side Menu Drawer */}
      {sideMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black opacity-20"
            onClick={toggleSideMenu}
          />

          {/* Drawer Content */}
          <div className="relative w-64 max-w-xs bg-gray-900 shadow-lg overflow-y-auto h-full">
            <div className="p-4">
              <button onClick={toggleSideMenu} className="absolute top-4 right-4 text-white">
                <X size={24} />
              </button>

              <div className="mt-8 space-y-6">
                <nav>
                  <ul className="space-y-4">
                    <li>
                      <button
                        onClick={() => {
                          toggleSideMenu(); // Close the menu
                          navigate('/'); // Navigate to the homepage route
                        }}
                        className="block py-2 text-white hover:text-purple-300 font-medium active:bg-pink-500 active:text-white rounded-md transition duration-150 ease-in-out"
                      >
                        Home
                      </button>
                    </li>
                    <li>
                      <a href="#popular" className="block py-2 text-white hover:text-purple-300 font-medium">
                        Most Popular
                      </a>
                    </li>
                    <li>
                      <a href="#movies" className="block py-2 text-white hover:text-purple-300 font-medium">
                        Anime Movies
                      </a>
                    </li>
                    <li>
                      <a href="#series" className="block py-2 text-white hover:text-purple-300 font-medium">
                        Anime Series
                      </a>
                    </li>
                  </ul>
                </nav>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-300">Genres</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {genres.slice(0, showMoreGenres ? genres.length : 10).map((genre, index) => (
                      <a
                        key={index}
                        href={`#genre-${genre.toLowerCase()}`}
                        className={`py-1 px-2 text-sm rounded hover:bg-gray-800 ${
                          index % 3 === 0
                            ? 'text-pink-400'
                            : index % 3 === 1
                              ? 'text-blue-300'
                              : 'text-violet-300'
                        }`}
                      >
                        {genre}
                      </a>
                    ))}
                  </div>
                  {genres.length > 10 && (
                    <button
                      onClick={toggleShowMoreGenres}
                      className="mt-2 text-sm text-purple-300 hover:text-purple-200"
                    >
                      {showMoreGenres ? 'Show Less' : 'More Genres'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-70"
            onClick={toggleFilter}
          />

          {/* Filter Content */}
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 to-pink-800 shadow-xl p-5 overflow-y-auto max-h-screen">
            <div className="relative w-full h-full flex flex-col">
              <button
                onClick={toggleFilter}
                className="absolute top-4 right-4 text-white z-10"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-bold mb-6 text-center mt-10">Filter</h2>

              <div className="space-y-4 flex-grow">
                {/* Type Dropdown */}
                <div>
                  <label className="block mb-2 text-sm">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="All">All</option>
                    <option value="Movie">Movie</option>
                    <option value="Series">Series</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block mb-2 text-sm">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="All">All</option>
                    <option value="Finished Airing">Finished Airing</option>
                    <option value="Currently Airing">Currently Airing</option>
                    <option value="Not Yet Aired">Not Yet Aired</option>
                  </select>
                </div>

                {/* Season Dropdown */}
                <div>
                  <label className="block mb-2 text-sm">Season</label>
                  <select
                    value={filterSeason}
                    onChange={(e) => setFilterSeason(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="All">All</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>

                {/* Year Dropdown */}
                <div>
                  <label className="block mb-2 text-sm">Release Year</label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="All">All</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Genres */}
                <div>
                  <label className="block mb-2 text-sm">Genres</label>
                  <div className="grid grid-cols-2 gap-2">
                    {genres.map((genre, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`genre-${genre}`}
                          checked={selectedGenres.includes(genre)}
                          onChange={() => handleGenreToggle(genre)}
                          className="rounded border-gray-600 text-purple-500 focus:ring-purple-400 bg-gray-800"
                        />
                        <label
                          htmlFor={`genre-${genre}`}
                          className="ml-2 text-sm"
                        >
                          {genre}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      toggleFilter();
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <div className="flex flex-wrap gap-2 text-sm">
            {searchQuery && (
              <div className="bg-purple-800 px-3 py-1 rounded-full">
                Search: {searchQuery}
              </div>
            )}
            {filterType !== 'All' && (
              <div className="bg-purple-800 px-3 py-1 rounded-full">
                Type: {filterType}
              </div>
            )}
            {filterStatus !== 'All' && (
              <div className="bg-purple-800 px-3 py-1 rounded-full">
                Status: {filterStatus}
              </div>
            )}
            {filterSeason !== 'All' && (
              <div className="bg-purple-800 px-3 py-1 rounded-full">
                Season: {filterSeason}
              </div>
            )}
            {filterYear !== 'All' && (
              <div className="bg-purple-800 px-3 py-1 rounded-full">
                Year: {filterYear}
              </div>
            )}
            {selectedGenres.map(genre => (
              <div key={genre} className="bg-purple-800 px-3 py-1 rounded-full">
                {genre}
              </div>
            ))}
          </div>
          <p className="text-gray-300 mt-2">
            Found {totalResults} results
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {results.map((anime) => (
              <div key={anime.id} className="bg-gray-800 bg-opacity-40 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-900/30 transition-shadow">
                <div className="relative pb-[140%]">
                  <img
                    src={anime.images?.jpg?.image_url || "/api/placeholder/280/400"}
                    alt={anime.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-10 pb-2 px-3">
                    <h3 className="text-sm font-medium line-clamp-2">{anime.title}</h3>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {anime.genres?.slice(0, 2).map((genre, idx) => (
                      <span key={idx} className="text-xs bg-purple-900 px-2 py-0.5 rounded-full">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>{anime.season} {anime.year}</span>
                    <span>{anime.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results State */}
        {!loading && results.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold mb-2">No results found</h3>
            <p className="text-gray-300">Try adjusting your filters or search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalResults > resultsPerPage && (
          <div className="mt-10 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${
                  currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-purple-800 hover:bg-purple-700'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, Math.ceil(totalResults / resultsPerPage)) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentPage === pageNumber
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                {Math.ceil(totalResults / resultsPerPage) > 5 && (
                  <>
                    <span className="px-1">...</span>
                    <button
                      onClick={() => handlePageChange(Math.ceil(totalResults / resultsPerPage))}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 hover:bg-gray-700"
                    >
                      {Math.ceil(totalResults / resultsPerPage)}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(totalResults / resultsPerPage)}
                className={`p-2 rounded-full ${
                  currentPage === Math.ceil(totalResults / resultsPerPage)
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-800 hover:bg-purple-700'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-4">Dunime</h3>
              <p className="max-w-md text-sm">
                Your ultimate destination for all things anime. Discover, and stay updated with the latest and greatest in anime entertainment.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-purple-300">About Us</a></li>
                <li><a href="#terms" className="hover:text-purple-300">Terms of Service</a></li>
                <li><a href="#privacy" className="hover:text-purple-300">Privacy Policy</a></li>
                <li><a href="#contact" className="hover:text-purple-300">Contact Us</a></li>
                <li><a href="#dmca" className="hover:text-purple-300">DMCA</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            &copy; 2025 Dunime. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}