/* Books */
DROP TABLE IF EXISTS books;
CREATE TABLE books (
    ISBN CHAR(13) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100),
    publisher VARCHAR(100),
    publish_year INT CHECK(publish_year BETWEEN 0 AND EXTRACT('year' FROM CURRENT_DATE)),
    publish_month INT CHECK(publish_month BETWEEN 1 AND 12),
    price NUMERIC(6,2),
    rating NUMERIC(4,2) CHECK(0 <= rating AND rating <= 10),
    sold INT CHECK(sold >= 0) DEFAULT 0
);

/* Users */
DROP TABLE IF EXISTS miners CASCADE;
CREATE TABLE miners (
    ID VARCHAR(10) PRIMARY KEY,
    password VARCHAR(200) NOT NULL, -- Using MD5 encryption, thus it's longer
    name VARCHAR(100) NOT NULL,
    mail VARCHAR(100) CHECK((mail IS NULL) OR (mail LIKE '%@%.%')),
    phone CHAR(11),
    gender INT CHECK(gender IN (0,1,2)), -- 0 for male, 1 for female, 2 for non-binary
    age INT CHECK(age>0)
);

/* Add initial miners - curator & tourist - to the miners table */
-- INSERT INTO miners VALUES ('00000', 'SaltLibrary', 'iodin', 'salt@library.com', 13620209723, 2, 18);

/* Book requests */
DROP TABLE IF EXISTS requested_books;
CREATE TABLE requested_books (
    ISBN CHAR(13) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100),
    publisher VARCHAR(100),
    publish_year INT CHECK(publish_year BETWEEN 0 AND EXTRACT('year' FROM CURRENT_DATE)),
    publish_month INT CHECK(publish_month BETWEEN 1 AND 12),
    price NUMERIC(6,2)
);

DROP TABLE IF EXISTS request;
CREATE TABLE request (
    ISBN CHAR(13) REFERENCES requested_books(ISBN),
    ID VARCHAR(10) REFERENCES miners(ID),
    request_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    request_state INT CHECK(request_state IN (1,2,3)), /* 1 for pending, 2 for added, 3 for turned down */
    PRIMARY KEY (ISBN, ID)
);

DROP TABLE IF EXISTS cart;
CREATE TABLE cart (
    ISBN CHAR(13) REFERENCES books(ISBN),
    ID VARCHAR(10) REFERENCES miners(ID),
    cart_num INT CHECK(cart_num > 0),
    PRIMARY KEY (ISBN, ID)
);

/* Marks */
DROP TABLE IF EXISTS marks;
CREATE TABLE marks (
    mark_id SERIAL PRIMARY KEY,
    ISBN CHAR(13) NOT NULL REFERENCES books(ISBN),
    ID VARCHAR(10) NOT NULL REFERENCES miners(ID),
    mark_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operation INT NOT NULL CHECK(operation IN (1,2,3,4)), /*1 for buy, 2 for tag, 3 for review, 4 for rate*/
    UNIQUE (ISBN, ID, mark_time, operation)
);

DROP TABLE IF EXISTS buy;
CREATE TABLE buy (
    mark_id INT PRIMARY KEY REFERENCES marks(mark_id),
    bought_num INT NOT NULL CHECK(bought_num > 0)
);

DROP TABLE IF EXISTS tag;
CREATE TABLE tag (
    mark_id INT PRIMARY KEY REFERENCES marks(mark_id),
    tag_state INT CHECK(tag_state IN (1,2,3)) /* 1 for To Read, 2 for Reading, 3 for Read */
);

DROP TABLE IF EXISTS review;
CREATE TABLE review (
    mark_id INT PRIMARY KEY REFERENCES marks(mark_id),
    content VARCHAR
);

DROP TABLE IF EXISTS rate;
CREATE TABLE rate (
    mark_id INT PRIMARY KEY REFERENCES marks(mark_id),
    rating INT CHECK(rating BETWEEN 0 AND 10)
);