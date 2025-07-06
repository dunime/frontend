import React, { useState, useEffect } from "react";

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

const buildTfIdf = (documents) => {
  const termFreqs = documents.map((doc) => {
    const tf = {};
    doc.forEach((term) => {
      tf[term] = (tf[term] || 0) + 1;
    });
    return tf;
  });

  const df = {};
  termFreqs.forEach((tf) => {
    Object.keys(tf).forEach((term) => {
      df[term] = (df[term] || 0) + 1;
    });
  });

  const N = documents.length;
  const tfidf = termFreqs.map((tf) => {
    const tfidfVec = {};
    Object.keys(tf).forEach((term) => {
      const tfVal = tf[term];
      const idfVal = Math.log(N / (df[term] || 1));
      tfidfVec[term] = tfVal * idfVal;
    });
    return tfidfVec;
  });

  return tfidf;
};

const cosineSimilarity = (vecA, vecB) => {
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  allTerms.forEach((term) => {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
};

const AnimeApp = () => {
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [animeList, setAnimeList] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const query = [];
        if (genre) query.push(`genres=${genre}`);
        if (year) query.push(`year=${year}`);
        if (type) query.push(`type=${type}`);
        const url = `https://api.jikan.moe/v4/anime?${query.join("&")}`;

        const response = await fetch(url);
        const data = await response.json();
        setAnimeList(data.data || []);
      } catch (error) {
        console.error("Error fetching anime:", error);
      }
    };

    fetchAnime();
  }, [genre, year, type]);

  const handleSelectAnime = (anime) => {
    setSelectedAnime(anime);

    const docs = animeList.map((item) => {
      const genres = item.genres?.map((g) => g.name).join(" ") || "";
      const text = `${item.title} ${genres} ${item.synopsis || ""}`;
      return tokenize(text);
    });

    const tfidfVectors = buildTfIdf(docs);
    const selectedIndex = animeList.findIndex((a) => a.mal_id === anime.mal_id);
    const selectedVec = tfidfVectors[selectedIndex];

    const scores = tfidfVectors.map((vec, i) => ({
      index: i,
      score: i === selectedIndex ? -1 : cosineSimilarity(selectedVec, vec),
    }));

    const topMatches = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => animeList[entry.index]);

    setRecommended(topMatches);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
          Anime Recommendation
        </h1>
      </header>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
        <select
          onChange={(e) => setGenre(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 rounded text-white"
        >
          <option value="">Select Genre</option>
          <option value="1">Action</option>
          <option value="2">Adventure</option>
          <option value="4">Comedy</option>
          <option value="8">Drama</option>
          <option value="10">Fantasy</option>
          <option value="22">Romance</option>
          <option value="24">Sci-Fi</option>
          <option value="14">Horror</option>
        </select>

        {/* <input
          type="number"
          placeholder="Enter Year"
          onChange={(e) => setYear(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 rounded text-white"
        /> */}

        <select
          onChange={(e) => setType(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 rounded text-white"
        >
          <option value="">Select Type</option>
          <option value="tv">TV Series</option>
          <option value="movie">Movie</option>
          <option value="ova">OVA</option>
          <option value="special">Special</option>
        </select>
      </div>

      {animeList.length > 0 && (
        <div className="mb-10 text-center">
          <select
            onChange={(e) => {
              const selectedId = parseInt(e.target.value);
              const found = animeList.find((a) => a.mal_id === selectedId);
              if (found) handleSelectAnime(found);
            }}
            className="bg-gray-800 border border-gray-700 p-2 rounded text-white w-full md:w-[300px]"
          >
            <option value="">Select an Anime</option>
            {animeList.map((anime) => (
              <option key={anime.mal_id} value={anime.mal_id}>
                {anime.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animeList.length === 0 ? (
          <p className="text-center col-span-full">No results found.</p>
        ) : (
          animeList.map((anime) => (
            <div
              key={anime.mal_id}
              className="bg-gray-800 rounded-lg shadow-md p-4 hover:scale-105 transition-transform"
            >
              <img
                src={anime.images.jpg.image_url}
                alt={anime.title}
                className="w-full h-64 object-cover rounded-md mb-3"
              />
              <h3 className="text-lg font-semibold">{anime.title}</h3>
              <button
                onClick={() => handleSelectAnime(anime)}
                className="mt-2 text-sm text-purple-400 hover:underline"
              >
                Details
              </button>
            </div>
          ))
        )}
      </div>

      {selectedAnime && (
        <div className="mt-12 bg-gray-800 p-6 rounded-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{selectedAnime.title}</h2>
          <p className="text-sm mb-2">{selectedAnime.synopsis}</p>
          <p className="text-xs text-purple-300 mb-4">
            Genre: {selectedAnime.genres?.map((g) => g.name).join(", ")}
          </p>

          <h3 className="text-lg font-bold mb-2">You may also like:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommended.map((rec) => (
              <div key={rec.mal_id} className="bg-gray-700 p-3 rounded">
                <img
                  src={rec.images.jpg.image_url}
                  alt={rec.title}
                  className="h-32 w-full object-cover rounded mb-2"
                />
                <p className="text-sm">{rec.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeApp;
