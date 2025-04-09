import { useState } from 'react'
import axios from 'axios'
import './App.css'

interface SearchResult {
  hash: string;
}

function App() {
  const [searchText, setSearchText] = useState('')
  const [numResults, setNumResults] = useState(15)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://arfetch.adityaberry.me/search',
        headers: { 
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          text: searchText,
          num_results: numResults
        })
      }

      const response = await axios.request(config)
      setResults(response.data.map((hash: string) => ({ hash })))
    } catch (error) {
      console.error('Error searching:', error)
      alert('Failed to connect to the server. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="search-container">
        <h1>AOSearch</h1>
        <div className="search-box">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Enter your search query..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <input
            type="number"
            value={numResults}
            onChange={(e) => setNumResults(Math.max(1, parseInt(e.target.value) || 1))}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
                e.preventDefault();
              }
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            min="1"
            style={{ 
              width: '3em', 
              padding: '8px 0',
              textAlign: 'center',
              fontSize: '14px',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              margin: '0 8px',
              minWidth: 'unset',
              flex: '0 0 auto'
            }}
          />
          <button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="results-container">
            <h2>Search Results</h2>
            <div className="image-grid">
              {results.map((result, index) => (
                <div 
                  key={result.hash} 
                  className="image-item"
                  onClick={() => window.open(`http://arnode.asia/${result.hash}`, '_blank')}
                >
                  <img 
                    src={`http://arnode.asia/${result.hash}`}
                    alt={`Result ${index + 1}`}
                    loading="lazy"
                  />
                  <div 
                    className="bazar-chip flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://bazar.arnode.asia/asset#/asset/${result.hash}`, '_blank');
                    }}
                  >
                    <span>View on </span>
                    <img src="/bazar.svg" alt="Bazar" className="bazar-logo" style={{ width: '11px', height: '10px' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App