export const CATEGORIES: Record<string, string[]> = {
  "Science & Nature": [
    "General Science", "Physics", "Chemistry", "Biology", "Astronomy", "Geology", 
    "Oceanography", "Meteorology", "Botany", "Zoology", "Ecology", "Genetics", 
    "Neuroscience", "Quantum Physics", "Paleontology", "Environmental Science",
    "Anatomy", "Evolution", "Microbiology", "Marine Biology", "Volcanology", 
    "Seismology", "Thermodynamics", "Organic Chemistry", "Nuclear Physics"
  ],
  "Technology": [
    "Computers", "Programming", "Artificial Intelligence", "Cybersecurity", "Blockchain", 
    "Internet History", "Smartphones", "Robotics", "Space Technology", "Video Game Development", 
    "Web Design", "Data Science", "Cloud Computing", "Cryptocurrency", "Virtual Reality",
    "Operating Systems", "Computer Hardware", "Software Engineering", "Tech Giants", "Inventions",
    "Nanotechnology", "Bioinformatics", "Telecommunications", "Drones", "3D Printing"
  ],
  "Mathematics": [
    "General Math", "Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry",
    "Number Theory", "Logic", "History of Mathematics", "Famous Mathematicians",
    "Probability", "Fractals", "Arithmetic", "Set Theory", "Topology"
  ],
  "Entertainment": [
    "Movies", "TV Shows", "Music", "Video Games", "Books", "Comics", "Anime & Manga", 
    "Theatre", "Board Games", "Cartoons", "Celebrities", "Musicals", "Reality TV",
    "K-Pop", "Harry Potter", "Star Wars", "Marvel Cinematic Universe", "DC Universe",
    "Disney", "Pixar", "The Lord of the Rings", "Game of Thrones", "Friends (TV Show)",
    "The Office", "Breaking Bad", "Classic Rock", "90s Pop", "Hip Hop History"
  ],
  "History": [
    "Ancient History", "Modern History", "World War I", "World War II", "Cold War", 
    "Renaissance", "Industrial Revolution", "Middle Ages", "Prehistory", "Civil Rights Movement", 
    "Space Race", "French Revolution", "American Civil War", "Roman Empire", "Ancient Egypt",
    "Ancient Greece", "Vikings", "The Aztecs", "The Incas", "The Mayans", "Feudal Japan",
    "British Monarchy", "History of Medicine", "Exploration & Discovery", "Pirates"
  ],
  "Geography": [
    "World Capitals", "Countries", "Flags", "Landmarks", "Rivers & Lakes", "Mountains", 
    "Deserts", "Cities", "Cultural Geography", "Maps", "Oceans", "Volcanoes", "Islands",
    "US States", "European Countries", "Asian Countries", "African Countries", 
    "South American Countries", "Currencies", "Languages", "Tourism"
  ],
  "Sports": [
    "Football (Soccer)", "Basketball", "American Football", "Baseball", "Tennis", "Cricket", 
    "Golf", "Olympics", "Formula 1", "Boxing", "MMA", "Swimming", "Athletics", "Winter Sports",
    "Rugby", "Hockey", "Volleyball", "Table Tennis", "Badminton", "Cycling", "Wrestling",
    "Surfing", "Skateboarding", "Extreme Sports", "World Cup History"
  ],
  "Arts & Literature": [
    "Famous Paintings", "Sculpture", "Classical Music", "Modern Art", "Poetry", "Novels", 
    "Authors", "Architecture", "Design", "Fashion History", "Shakespeare", "Greek Mythology",
    "Roman Mythology", "Norse Mythology", "Egyptian Mythology", "Philosophy", "Religion",
    "Photography", "Dance", "Opera"
  ],
  "Lifestyle & Culture": [
    "Food & Drink", "Health & Fitness", "Travel", "Cars", "Fashion", "Gardening", "DIY", 
    "Pets", "Psychology", "Economics", "Politics", "Law", "Business", "Marketing",
    "Social Media", "Journalism", "Education", "Cryptids & Urban Legends", "Holidays"
  ],
  "Vehicles": [
    "Cars", "Motorcycles", "Aviation", "Trains", "Boats & Ships", "Trucks", 
    "Electric Vehicles", "Spacecraft", "Military Vehicles", "Classic Cars"
  ],
  "Animals": [
    "Dogs", "Cats", "Birds", "Fish", "Insects", "Reptiles", "Mammals", "Endangered Species",
    "Dinosaurs", "Deep Sea Creatures", "Australian Wildlife", "African Safari"
  ]
};

export const FLATTENED_CATEGORIES = Object.values(CATEGORIES).flat();
