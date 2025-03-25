CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('recurring', 'occasional')) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('karaoke', 'dj set', 'live music')) NOT NULL,
  image VARCHAR(255),
  location_id INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  weekday VARCHAR(20), -- only for recurring events
  frequency VARCHAR(20) CHECK (frequency IN ('weekly', 'biweekly')),
  time TIME, -- time for recurring and occasional events
  date DATE, -- only for occasional events
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
