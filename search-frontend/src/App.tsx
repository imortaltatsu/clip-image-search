import { useState } from 'react'
import axios from 'axios'
import './App.css'

interface SearchResult {
  hash: string;
  isSelected: boolean;
}

function App() {
  const [searchText, setSearchText] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://arfetch.adityaberry.me/search',
        headers: { 
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          text: searchText,
          num_results: 15
        })
      }

      const response = await axios.request(config)
      setResults(response.data.map((hash: string) => ({ hash, isSelected: false })))
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelection = (index: number) => {
    setResults(results.map((result, i) => 
      i === index ? { ...result, isSelected: !result.isSelected } : result
    ))
  }

  const viewSelected = () => {
    const selectedHashes = results.filter(r => r.isSelected).map(r => r.hash)
    selectedHashes.forEach(hash => {
      window.open(`http://arnode.asia/${hash}`, '_blank')
    })
  }

  return (
    <div className="app-container">
      <div className="search-container">
        <h1>Retro Search</h1>
        <div className="search-box">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Enter your search query..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="results-container">
            <div className="results-header">
              <h2>Search Results</h2>
              <button onClick={viewSelected} className="view-selected">
                View Selected ({results.filter(r => r.isSelected).length})
              </button>
            </div>
            <div className="image-grid">
              {results.map((result, index) => (
                <div 
                  key={result.hash} 
                  className={`image-item ${result.isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSelection(index)}
                >
                  <img 
                    src={`http://arnode.asia/${result.hash}`}
                    alt={`Result ${index + 1}`}
                    loading="lazy"
                  />
                  <div className="image-overlay">
                    <input
                      type="checkbox"
                      checked={result.isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelection(index);
                      }}
                    />
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