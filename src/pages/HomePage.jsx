import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Icons

import { Menu, X, Search, ChevronLeft, ChevronRight, Play } from "lucide-react";
import axios from "axios";


// ... (rest of your sample data)

const carouselSlides = [
  {
    id: 1,
    title: "Demon Slayer: Kimetsu no Yaiba",
    image: "/api/placeholder/1200/500",
    description:
      "Follow Tanjiro as he seeks to cure his sister and avenge his family.",
  },
  {
    id: 2,
    title: "Attack on Titan",
    image: "/api/placeholder/1200/500",
    description: "Humanity's last stand against the Titans.",
  },
  {
    id: 3,
    title: "Jujutsu Kaisen",
    image: "/api/placeholder/1200/500",
    description: "A boy joins a secret organization to fight cursed spirits.",
  },
  {
    id: 4,
    title: "Spy x Family",
    image: "/api/placeholder/1200/500",
    description:
      "A spy, an assassin, and a telepath come together to form a family.",
  },
  {
    id: 5,
    title: "Chainsaw Man",
    image: "/api/placeholder/1200/500",
    description:
      "A young man with a devil chainsaw heart fights in a world of demons.",
  },
];

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
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Game",
  "Harem",
  "Horror",
  "Isekai",
  "Shounen",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "School",
  "Sci-fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Vampire",
];

// Main Component
export default function DunimeHomePage() {
  const navigate = useNavigate();

  const handleViewRecommendation = () => {
    navigate("/filter");
  };

  // State Management
  const [selectedAnime, setSelectedAnime] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [topAiringAnime, setTopAiringAnime] = useState(
    loadFromLocalStorage("topAiringAnimeData") || []
  );
  const [topUpcomingAnime, setTopUpcomingAnime] = useState(
    loadFromLocalStorage("topUpcomingAnimeData") || []
  );
  const [topPopularAnime, setTopPopularAnime] = useState([]);
  const [spring2025Anime, setSpring2025Anime] = useState([]);
  const [latestUpdatedEpisodes, setLatestUpdatedEpisodes] = useState([]);

  const fetchAnimesByFilter = useCallback(async (filter) => {
    const response = await axios.get(
      `https://api.jikan.moe/v4/top/anime?filter=${filter}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  }, []);

  const fetchSpring2025Anime = useCallback(async () => {
    const response = await axios.get(
      "https://api.jikan.moe/v4/seasons/2025/spring",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    setSpring2025Anime(response.data.data);
  }, []);

  const fetchLatestUpdatedEpisodes = useCallback(async () => {
    const response = await axios.get(
      "https://api.jikan.moe/v4/anime?order_by=start_date&sort=desc",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    setLatestUpdatedEpisodes(response.data.data);
    // console.log('latest episodes', response.data.data)
  }, []);

  useEffect(() => {
    fetchSpring2025Anime();
    fetchLatestUpdatedEpisodes();
  }, []);

  useEffect(() => {
    const fetchTopAiring = async () => {
      try {
        const data = await fetchAnimesByFilter("airing");
        setTopAiringAnime(data);
        saveToLocalStorage("topAiringAnimeData", data);
      } catch (error) {
        console.error("Error fetching top airing anime:", error);
      }
    };

    if (!loadFromLocalStorage("topAiringAnimeData")) {
      fetchTopAiring();
    }
  }, [fetchAnimesByFilter]);

  useEffect(() => {
    const fetchTopUpcoming = async () => {
      try {
        const data = await fetchAnimesByFilter("upcoming");
        setTopUpcomingAnime(data);
        saveToLocalStorage("topUpcomingAnimeData", data);
      } catch (error) {
        console.error("Error fetching top upcoming anime:", error);
      }
    };

    if (!loadFromLocalStorage("topUpcomingAnimeData")) {
      fetchTopUpcoming();
    }
  }, [fetchAnimesByFilter]);

  useEffect(() => {
    const fetchTopPopular = async () => {
      try {
        const data = await fetchAnimesByFilter("bypopularity");
        setTopPopularAnime(data);
      } catch (error) {
        console.error("Error fetching top popular anime:", error);
      }
    };

    fetchTopPopular();
  }, [fetchAnimesByFilter]);

  // Auto Slide Effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 3000);

    return () => clearInterval(slideInterval);
  }, []);

  // Carousel Navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length
    );
  };

  // For horizontal scrolling sections
  const scrollContainerRef = useRef({});

  const scrollLeft = (sectionId) => {
    if (scrollContainerRef.current[sectionId]) {
      scrollContainerRef.current[sectionId].scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = (sectionId) => {
    if (scrollContainerRef.current[sectionId]) {
      scrollContainerRef.current[sectionId].scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  // Register refs for sections
  const registerRef = (sectionId, ref) => {
    scrollContainerRef.current[sectionId] = ref;
  };

  const toggleShowMoreGenres = () => {
    setShowMoreGenres(!showMoreGenres);
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
 const applyFilters = () => {
   const params = new URLSearchParams();

   if (filterType !== 'All') params.set('type', filterType);
   if (filterStatus !== 'All') params.set('status', filterStatus);
   if (filterSeason !== 'All') params.set('season', filterSeason);
   if (filterYear !== 'All') params.set('year', filterYear);
   if (selectedGenres.length > 0) params.set('genre', selectedGenres.join(','));
navigate(`/filter?${params.toString()}`);
   setFilterOpen(false);
   // Optionally reset current page if you have pagination
   // setCurrentPage(1);
  };
  const handleGenreChange = (genre) => {
   if (selectedGenres.includes(genre)) {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
   } else {
    setSelectedGenres([...selectedGenres, genre]);
   }
  };
  // Generate years for filter dropdown
  const years = Array.from({ length: 2025 - 1917 + 1 }, (_, i) => 2025 - i);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
          searchQuery
        )}&limit=10`
      );
      setSearchResults(response.data.data);
    } catch (error) {
      console.error("Error searching anime:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 to-pink-800 shadow-lg p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSideMenu} className="text-white">
              <Menu size={24} />
            </button>
            <a href="#" className="flex items-center">
              {/* <img
                src="/api/placeholder/32/32"
                alt="Dunime Logo"
                className="w-8 h-8 rounded-full"
              /> */}
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
                Dunime
              </span>
            </a>
          </div>
          <button
            onClick={handleViewRecommendation}
            className="bg-purple-600 cursor-pointer hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            View Recommendation
          </button>
          <button onClick={toggleSearch} className="text-white">
            <Search size={24} />
          </button>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex  items-center">
              <input
                type="text"
                placeholder="Search anime..."
                className="w-[25%] p-2 rounded bg-gray-800 border-none  focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-purple-600 cursor-pointer hover:bg-purple-700 text-white px-8 py-2 rounded"
              >
                Search
              </button>
            </div>

            {isSearching && (
              <div className="text-sm text-gray-300">Searching...</div>
            )}
            <div className="grid grid-cols-3 gap-4 justify-between w-full">
              {searchResults?.map((anime) => (
                <div
                  key={anime.id}
                  className="bg-gray-800 p-4 rounded-lg max-w-96 h-52 flex gap-8 shadow hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedAnime(anime)}
                >
                  <img
                    src={anime.images?.jpg?.image_url}
                    alt={anime.title}
                    className="w-30 object-cover rounded"
                  />
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {anime.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
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
              <button
                onClick={toggleSideMenu}
                className="absolute top-4 right-4 text-white"
              >
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
                      <a
                        href="Filter"
                        className="block py-2 text-white hover:text-purple-300 font-medium"
                      >
                        Recommendation
                      </a>
                    </li>
                    <li>
                      <a
                        href="ChatBot"
                        className="block py-2 text-white hover:text-purple-300 font-medium"
                      >
                        Chat Bot
                      </a>
                    </li>
                    <li></li>
                  </ul>
                </nav>

                {/* <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-300">
                    Genres
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {genres
                      .slice(0, showMoreGenres ? genres.length : 10)
                      .map((genre, index) => (
                        <a
                          key={index}
                          href={`#genre-${genre.toLowerCase()}`}
                          className={`py-1 px-2 text-sm rounded hover:bg-gray-800 ${
                            index % 3 === 0
                              ? "text-pink-400"
                              : index % 3 === 1
                              ? "text-blue-300"
                              : "text-violet-300"
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
                      {showMoreGenres ? "Show Less" : "More Genres"}
                    </button>
                  )}
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}

{filterOpen && (
  <div className="fixed inset-0 z-50 flex justify-center items-center">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black bg-opacity-70"
      onClick={toggleFilter}
    />

    {/* Filter Content - Modified for full page */}
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 to-pink-800 shadow-xl p-5 overflow-y-auto max-h-screen"> {/* Removed overflow-y-auto here */}
      <div className="relative w-full h-full flex flex-col">
        <button
          onClick={toggleFilter}
          className="absolute top-4 right-4 text-white z-10"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center mt-10">Filter</h2>

        <div className="space-y-4 flex-grow"> {/* Removed overflow-y-auto from here as well */}
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
                toggleSearch();
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md"
            >
              Cancel
            </button>
            <button
             onClick={() => {
   applyFilters();
  }}
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
      <main className="container mx-auto px-4 pb-12">
        {/* Hero Carousel */}
        <section className="relative h-64 md:h-96 mt-6 mb-10 overflow-hidden rounded-lg">
          {/* Carousel Slides */}
          <div className="h-full relative">
            {carouselSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 p-4 md:p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {slide.title}
                  </h2>
                  <p className="text-sm md:text-base text-gray-200 mt-2 max-w-xl">
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
          >
            <ChevronRight size={24} />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentSlide ? "bg-white" : "bg-gray-500"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Content Sections */}
        <AnimeSection
          title="Top Trending Anime"
          animeList={topPopularAnime}
          sectionId="trending"
          registerRef={registerRef}
          scrollLeft={scrollLeft}
          scrollRight={scrollRight}
          showRank={true}
        />

        <AnimeSection
          title="Top Airing"
          animeList={topAiringAnime}
          sectionId="airing"
          registerRef={registerRef}
          scrollLeft={scrollLeft}
          scrollRight={scrollRight}
        />

        <AnimeSection
          title="Spring 2025 Anime"
          animeList={spring2025Anime}
          sectionId="spring"
          registerRef={registerRef}
          scrollLeft={scrollLeft}
          scrollRight={scrollRight}
        />

        <AnimeSection
          title="Top Upcoming"
          animeList={topUpcomingAnime}
          sectionId="upcoming"
          registerRef={registerRef}
          scrollLeft={scrollLeft}
          scrollRight={scrollRight}
        />

        {/* Anime Reviews Button */}

        <div className="mt-10 text-center">
          <a
            href="#reviews"
            className="inline-block py-3 px-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transform transition-all"
          >
            Anime Reviews
          </a>
        </div>

        <section className="mt-12">
          x<h2 className="text-2xl font-bold mb-4">A-Z List</h2>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
            <p className="mb-3 text-gray-300 text-sm">
              Search anime by name alphabetically:
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 26 }, (_, i) =>
                String.fromCharCode(65 + i)
              ).map((letter) => (
                <a
                  key={letter}
                  href={`#list-${letter}`}
                  className="w-8 h-8 flex items-center justify-center bg-purple-900 hover:bg-purple-700 rounded-md"
                >
                  {letter}
                </a>
              ))}
              <a></a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
    </div>
  );
}

function AnimeSection({
  title,
  animeList,
  sectionId,
  registerRef,
  scrollLeft,
  scrollRight,
  showRank = false,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      registerRef(sectionId, ref.current);
    }
  }, [registerRef, sectionId]);

  return (
    <section className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <a
          href={`#${sectionId}-all`}
          className="text-sm text-purple-300 hover:text-purple-200"
        >
          View All
        </a>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollLeft(sectionId)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={ref}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {animeList.map((anime, index) => (
            <div key={index} className="flex-shrink-0 w-36 md:w-44">
              <div className="relative group">
                <img
                  src={anime?.images?.jpg?.image_url}
                  alt={anime.title}
                  className="w-full h-52 md:h-64 object-cover rounded-md group-hover:opacity-75 transition-opacity"
                />

                {showRank && (
                  <div className="absolute top-0 left-0 w-8 h-8 bg-purple-600 rounded-tl-md rounded-br-md flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={`#anime-${anime.id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-1 px-3 rounded-md"
                  >
                    Details
                  </a>
                </div>
              </div>
              <h3 className="mt-2 text-sm font-medium line-clamp-2">
                {anime.title}
              </h3>
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollRight(sectionId)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
