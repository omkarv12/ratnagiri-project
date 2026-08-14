import React from "react";

const SearchSection = () => {
  return (
    <div style={styles.searchSection}>
      <div style={styles.linksContainer}>
        <a href="#" style={styles.link}>🔍 Interactive Map</a>
        <a href="#" style={styles.link}>📅 Register a location or a homestay</a>
        <a href="#" style={styles.link}>🗺️ Ratnagiri's tourist map</a>
      </div>
      <form style={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search..."
          style={styles.input}
          name="search"
        />
        <button type="submit" style={styles.button}>
          SEARCH
        </button>
      </form>
    </div>
  );
};

const styles = {
  searchSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: "10px 20px",
    borderRadius: 8,
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
  },
  linksContainer: {
    display: "flex",
    gap: 20,
    flex: 1,
  },
  link: {
    textDecoration: "none",
    color: "#12404a",
    fontWeight: "600",
    fontSize: 14,
  },
  searchForm: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    padding: "8px",
    fontSize: 14,
    border: "1px solid #ccc",
    borderRadius: "4px 0 0 4px",
    outline: "none",
  },
  button: {
    backgroundColor: "#12404a",
    color: "white",
    border: "none",
    padding: "9px 16px",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "0 4px 4px 0",
  },
};

export default SearchSection;