import React, { useState, useEffect, useRef } from "react";
import { tokenize, buildTfIdf, cosineSimilarity } from "./utils";
import Fuse from "fuse.js";

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey! I’m Duni 🤖 — your anime assistant. Ask me anything!",
    },
  ]);
  const [recommendations, setRecommendations] = useState([]);
  const chatEndRef = useRef(null);

  const genres = {
    Action: "Action",
    Adventure: "Adventure",
    Comedy: "Comedy",
    Drama: "Drama",
    Fantasy: "Fantasy",
    Romance: "Romance",
    "Sci-Fi": "Sci-Fi",
    Horror: "Horror",
    Mecha: "Mecha",
    "Slice of Life": "Slice of Life",
  };

  const extractFilters = (text) => {
    const lower = text.toLowerCase();
    const genreKey = Object.keys(genres).find((g) =>
      lower.includes(g.toLowerCase())
    );
    const year = (lower.match(/\b(19|20)\d{2}\b/) || [])[0];
    const likeMatch = lower.match(/like\s+(.*?)$/i);
    const numMatch = lower.match(/\b(\d{1,2})\b/);
    const userCount = numMatch ? parseInt(numMatch[1]) : null;
    const count = userCount && userCount > 0 ? Math.min(userCount, 10) : 3;

    return {
      genre: genreKey ? genres[genreKey] : "",
      year: year || "",
      similarTo: likeMatch ? likeMatch[1].trim() : "",
      count,
      original: lower,
    };
  };

  const fetchAnime = async (filters) => {
    const query = `
      query ($page: Int, $perPage: Int, $genre: String, $year: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, genre: $genre, seasonYear: $year) {
            id
            title {
              romaji
              english
              native
            }
            description(asHtml: false)
            coverImage {
              large
            }
          }
        }
      }
    `;

    const variables = {
      page: 1,
      perPage: 50,
      genre: filters.genre || undefined,
      year: filters.year ? parseInt(filters.year) : undefined,
    };

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });

      const data = await response.json();
      return data.data.Page.media.map((anime) => ({
        id: anime.id,
        title: anime.title.english || anime.title.romaji,
        synopsis: anime.description?.replace(/<[^>]+>/g, ""),
        images: {
          jpg: {
            image_url: anime.coverImage.large,
          },
        },
      }));
    } catch (err) {
      console.error("AniList fetch failed:", err);
      return [];
    }
  };

  const recommendSimilar = (list, refTitle) => {
    const fuse = new Fuse(list, { keys: ["title"], threshold: 0.4 });
    const result = fuse.search(refTitle);
    if (!result.length) return [];

    const selected = result[0].item;
    const docs = list.map((item) => tokenize(`${item.title} ${item.synopsis}`));
    const tfidfVectors = buildTfIdf(docs);
    const selectedIndex = list.findIndex((a) => a.id === selected.id);
    const base = tfidfVectors[selectedIndex];

    return tfidfVectors
      .map((vec, i) => ({
        index: i,
        score: i === selectedIndex ? -1 : cosineSimilarity(base, vec),
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => list[entry.index]);
  };

  const answerWithWiki = async (text) => {
    const match = text.match(/what is (.+?) about/i);
    if (!match) return "";
    const query = match[1];
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          query
        )}`
      );
      if (!res.ok) return `Sorry, I couldn’t find info on "${query}".`;
      const data = await res.json();
      return `${data.title}: ${data.extract}`;
    } catch {
      return "Sorry, something went wrong while fetching information.";
    }
  };

  const handleAsk = async () => {
    if (!input.trim()) return;

    const filters = extractFilters(input.trim());
    setMessages((prev) => [...prev, { sender: "user", text: input.trim() }]);
    setInput("");
    setRecommendations([]);

    let reply = "";
    let animeList = [];

    if (filters.original.includes("what is")) {
      reply = await answerWithWiki(filters.original);
    } else {
      let list = await fetchAnime(filters);

      if (!list.length && (filters.genre || filters.year)) {
        list = await fetchAnime({ genre: "", year: "" });
      }

      animeList = filters.similarTo
        ? recommendSimilar(list, filters.similarTo)
        : list;

      if (!animeList.length && filters.similarTo) {
        animeList = list;
      }

      animeList = animeList.slice(0, filters.count);

      reply = animeList.length
        ? `Here ${animeList.length === 1 ? "is" : "are"} ${
            animeList.length
          } anime you might like:`
        : "Sorry, I couldn't find anything matching that.";
    }

    setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    setRecommendations(animeList);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, recommendations]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="bg-purple-700 p-4 text-xl font-bold">Chat Duni</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-xl px-4 py-3 rounded-lg ${
              msg.sender === "user"
                ? "ml-auto bg-purple-600"
                : "mr-auto bg-gray-700"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {recommendations.map((anime) => (
          <div key={anime.id} className="bg-gray-800 p-4 rounded max-w-xl">
            <div className="flex gap-4">
              <img
                src={anime.images.jpg.image_url}
                alt={anime.title}
                className="w-24 h-32 object-cover rounded"
              />
              <div>
                <h3 className="font-bold text-white mb-1">{anime.title}</h3>
                <p className="text-gray-300 text-sm">
                  {anime.synopsis?.slice(0, 140)}...
                </p>
              </div>
            </div>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      <div className="bg-gray-800 p-4 border-t border-gray-700 flex gap-2">
        <input
          className="flex-1 bg-gray-700 p-2 rounded text-white placeholder-gray-400"
          type="text"
          placeholder="Ask Duni anything anime-related..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
        />
        <button
          onClick={handleAsk}
          className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
        >
          Ask
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
