import React, { useState, useEffect } from "react";

const coverUrl = (cover_i) =>
  cover_i
    ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`
    : "https://via.placeholder.com/150x200?text=No+Cover";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [numFound, setNumFound] = useState(0);

  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!query) return;
    fetchResults(query, page);
  }, [page]);

  async function fetchResults(q, p = 1) {
    setLoading(true);
    setError(null);

    try {
      const offset = (p - 1) * PAGE_SIZE;
      const resp = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(
          q
        )}&limit=${PAGE_SIZE}&offset=${offset}`
      );

      if (!resp.ok) throw new Error("API request failed");

      const data = await resp.json();
      setResults(data.docs || []);
      setNumFound(data.numFound || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim() === "") return;
    setPage(1);
    fetchResults(query, 1);
  }

  function clear() {
    setQuery("");
    setResults([]);
    setNumFound(0);
    setPage(1);
  }

  const totalPages = Math.ceil(numFound / PAGE_SIZE);

  return (
    <div className="container">
      <h1>📚 Book Finder</h1>

      <form className="search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search book title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
        {results.length > 0 && (
          <button type="button" onClick={clear}>
            Clear
          </button>
        )}
      </form>

      {loading && <p className="status">Loading...</p>}
      {error && <p className="status error">❌ {error}</p>}

      {!loading && results.length === 0 && query && (
        <p className="status">No results found.</p>
      )}

      <div className="grid">
        {results.map((book) => (
          <div key={book.key} className="card">
            <img src={coverUrl(book.cover_i)} alt={book.title} />
            <h3>{book.title}</h3>
            <p>
              {book.author_name
                ? book.author_name.join(", ")
                : "Unknown Author"}
            </p>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="pagination">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            ◀ Prev
          </button>

          <span>
            Page {page} / {totalPages || 1}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}
