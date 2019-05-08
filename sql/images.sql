
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS images;


CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    url VARCHAR(300) NOT NULL,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES images(id),
    comment VARCHAR(600) NOT NULL,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);