import React from "react";
import { Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate hook

export default function DunimeDashboard() {
  const navigate = useNavigate(); // ✅ Hook to redirect

  const navLinks = [
    { title: "Home", path: "/home" },

    { title: "Recommendation", path: "/Filter" },
    { title: "ChatBot", path: "/ChatBot" },
  ];

  const contentSections = [
    {
      title: "Dunime.com - Your Safe And Fast Site To Recommend Anime Online",
      placeholder: `Anime has become global, something half the population of the world are into...`,
    },
    {
      title: "What Is Dunime.com",
      placeholder: `Dunime is a new anime recommendation system on the bock...`,
    },
    {
      title: "Is There A Dunime App",
      placeholder: `There is no a Dunime app yet. There is only the website for now...`,
    },
    {
      title: "How To Use Dunime Site",
      placeholder: `To use the dunime site you first of all register...`,
    },
    {
      title: "Can Dunime Compare To MyAnimeList And AniReco",
      placeholder: `MyAnime list and AniReco are one of the two most popular anime recommendation systems...`,
    },
    {
      title: "Why You Should Use Dunime To Recommend Online",
      placeholder: `Usrs might still want to use other recommenders, yes...`,
    },
  ];

  const handleViewFullSite = () => {
    navigate("/home"); // ✅ Redirects to homepage
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-800">
      {/* Hero Section */}
      <header className="relative h-auto bg-gradient-to-r from-purple-900 to-pink-800 overflow-hidden pb-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1493589976221-c2357c31ad77?w=1600&auto=format&fit=crop&q=80)",
          }}
        ></div>

        <div className="relative z-10 container mx-auto h-full flex flex-col justify-start px-6 py-12 space-y-8">
          {/* Navigation */}
          <nav className="flex flex-wrap justify-center md:justify-start items-center space-x-6 mb-6">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.path}
                className="text-white text-lg hover:text-pink-300 font-semibold transition-colors"
              >
                {link.title}
              </a>
            ))}
          </nav>

          {/* Logo + Search + Right Image */}
          <div className="flex flex-col md:flex-row md:items-start justify-between space-y-10 md:space-y-0 md:space-x-12">
            {/* Left: Logo and Search */}
            <div className="flex flex-col space-y-5">
              <div className="flex items-center space-x-4">
                <h1 className="text-5xl font-bold text-white">Dunime</h1>
                <div className="h-20 w-20 relative rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src="https://bcassetcdn.com/public/blog/wp-content/uploads/2021/11/10192901/anime-fandub-project-logo-by-nikita-zadvornijs-dribbble.png"
                    alt="Anime character"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Search Bar + Button */}
              <div className="flex w-full md:w-[900px] items-center space-x-3">
                <input
                  type="text"
                  placeholder="Search anime..."
                  className="flex-grow py-4 px-5 rounded-xl bg-gray-900 bg-opacity-80 text-white text-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="p-4 rounded-full bg-pink-500 hover:bg-pink-600 transition">
                  <Search className="text-white" size={24} />
                </button>
              </div>

              {/* View Full Site Button */}
              <div className="pt-4">
                <button
                  onClick={handleViewFullSite} // ✅ Go to homepage
                  className="max-w-[200px] w-full py-3 bg-pink-500 hover:bg-pink-600 text-black text-lg font-semibold rounded-[300px] flex items-center justify-center transition-all shadow-md"
                >
                  View Full Site
                  <ChevronRight size={24} className="ml-2" />
                </button>
              </div>
            </div>

            {/* Right: Big Image */}
            <div className="hidden md:block w-full md:w-[100px] lg:w-[500px]">
              <img
                src="https://i.postimg.cc/0jyWTZrC/sakura-transparent.png"
                alt="Featured anime"
                className="rounded-2xl shadow-xl object-cover w-full h-auto"
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="pt-12">
            <p className="text-white text-xl md:text-2xl font-light text-center md:text-left">
              Dunime.com - Your Safe and Fast Site To Recommend Anime Free
              Online
            </p>
          </div>
        </div>
      </header>

      {/* Content Sections */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {contentSections.map((section, index) => (
            <section
              key={index}
              className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {section.title}
              </h2>
              <div className="text-white opacity-70 italic p-4 rounded">
                {section.placeholder}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 bg-opacity-80 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; 2025 Dunime. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
