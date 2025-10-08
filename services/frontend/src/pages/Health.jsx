import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL; // e.g. http://localhost:8000

export default function Health() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${API}/health`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => setState({ loading: false, error: null, data: j }))
      .catch((e) => setState({ loading: false, error: e.message, data: null }));
    return () => ctrl.abort();
  }, []);

  if (state.loading) return <p>Loading…</p>;
  if (state.error) return <p style={{ color: "crimson" }}>Error: {state.error}</p>;
  return (
    <section>
      <h1>Health</h1>
      <pre>{JSON.stringify(state.data, null, 2)}</pre>
    </section>
  );
}
