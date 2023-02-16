CREATE DATABASE IF NOT EXISTS Reviews;
USE Reviews;

CREATE TABLE IF NOT EXISTS reviews(
  id INT NOT NULL,
  product_id INT NOT NULL,
  rating INT,
  summary TEXT,
  body TEXT,
  recommend BOOLEAN,
  reported BOOLEAN,
  name TEXT,
  email TEXT,
  PRIMARY KEY(id),
  FOREIGN KEY (photos) REFERENCES reviewPhotos(review_id),
  FOREIGN KEY (characteristics) REFERENCES reviewCharacteristics(review_id)
)
CREATE TABLE IF NOT EXISTS reviewPhotos(
  review_id INT NOT NULL,
  url TEXT
)
CREATE TABLE IF NOT EXISTS meta (
 product_id INT NOT NULL,
 ratings TEXT,
 recommend TEXT,
 PRIMARY KEY (product_id),
 FOREIGN KEY (characteristics) REFERENCES reviewCharacteristics(review_id)
)
CREATE TABLE IF NOT EXISTS reviewCharacteristics (
  review_id INT NOT NULL,
  characteristic_id INT,
  recommend INT,
  value INT,
)