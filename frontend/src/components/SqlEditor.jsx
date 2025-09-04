import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import axios from 'axios';
import { backend_url } from '../config/config.js';

export default function SqlEditor() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const runQuery = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${backend_url}/query`, { SQLQuery: query });
      
      // Adjust according to actual backend response structure
      setResult(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">SQL Editor</h2>

      <div className="border rounded-lg overflow-hidden">
        <CodeMirror
          value={query}
          height="300px"
          extensions={[sql()]}
          onChange={(value) => setQuery(value)}
          placeholder="Write your SQL query here..."
          className="bg-white"
        />
      </div>

      <button
        onClick={runQuery}
        disabled={loading || !query.trim()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running…' : 'Run'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-medium mb-2">Result</h3>
          {Array.isArray(result) && (result).length > 0 ? (
            <div className="overflow-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(result[0]).map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left text-sm font-medium text-black"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.map((row, i) => (
                    <tr key={i}>
                      {Object.entries(row).map(([key, val]) => (
                        <td key={key} className="px-4 py-2 text-sm text-black">
                          {val !== null ? val.toString() : 'NULL'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 text-gray-600">{result?.message || "No results found."}</div>
          )}
        </div>
      )}
    </div>
  );
}
