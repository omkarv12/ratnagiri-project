import { ChevronRight } from "lucide-react";

const cards = [
  {
    href: "#beaches-forts",
    imgSrc:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    alt: "Beaches and Forts",
    title: "Beaches and Forts",
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#sadas-petroglyphs",
    imgSrc:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
    alt: "Sadas and Petroglyphs",
    title: "Sadas and Petroglyphs",
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#mountains-orchards",
    imgSrc:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
    alt: "Mountains, Orchards and Devrais",
    title: (
      <>
        Mountains, Orchards and <em>Devrais</em>
      </>
    ),
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#temples-heritage",
    imgSrc:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    alt: "Temples and Heritage Places",
    title: "Temples and Heritage Places",
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#season",
    imgSrc:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
    alt: "Something for every Season",
    title: "Something for every Season",
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#cities-villages",
    imgSrc:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
    alt: "Prominent Cities and Villages",
    title: "Prominent Cities and Villages",
    subtitle: "FULLY INCLUSIVE",
  },
];

const DiscoverRatnagiri = () => {
  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        margin: 20,
        backgroundColor: "#fff",
        color: "#222",
        maxWidth: 1200,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#c0a060",
          letterSpacing: "1.5px",
          textAlign: "center",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        RATNAGIRI HAS SOMETHING FOR EVERYONE
      </div>

      <h1
        style={{
          fontWeight: "normal",
          fontSize: "2rem",
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        Discover Ratnagiri, Discover Konkan
      </h1>

      <div
        style={{
          fontSize: 13,
          textAlign: "center",
          marginBottom: 20,
          color: "#555",
        }}
      >
        Rare paths catalogued and highly recommended by veteran travelers.
      </div>

      <button
        style={{
          backgroundColor: "#e5dcae",
          color: "#000",
          padding: "6px 12px",
          fontWeight: "bold",
          fontSize: 12,
          borderRadius: 4,
          border: "none",
          cursor: "pointer",
          marginBottom: 30,
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        onClick={() => alert("Map View clicked")} // Replace with your handler
      >
        MAP VIEW
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))",
          gap: 20,
        }}
      >
        {cards.map(({ href, imgSrc, alt, title, subtitle }) => (
          <a
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fff",
              borderRadius: 4,
              color: "inherit",
              textDecoration: "none",
              boxShadow: "0 0 8px rgba(0,0,0,0.1)",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 8px rgba(0,0,0,0.1)";
            }}
          >
            <img
              src={imgSrc}
              alt={alt}
              style={{
                width: "100%",
                height: "auto",
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                objectFit: "cover",
              }}
            />
            <div
              style={{
                padding: 16,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                  marginBottom: 10,
                  fontWeight: "normal",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  color: "#999",
                  letterSpacing: "0.05em",
                  marginBottom: 6,
                }}
              >
                {subtitle}
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 13,
                  color: "#396aab",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: "auto", // push to bottom
                }}
              >
                Itineraries <ChevronRight size={14} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DiscoverRatnagiri;