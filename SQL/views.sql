/**
 * 5 views
 * 4 for 4 operations
 * 1 for general marks
 */

/* Buy */
CREATE OR REPLACE VIEW buy_view(isbn, id, bought_date, bought_num) AS
    SELECT isbn, id, DATE(mark_time) AS bought_date, bought_num
    FROM buy NATURAL JOIN marks;

/* Tag */
CREATE OR REPLACE VIEW tag_view(isbn, id, tag_date, tag_state) AS
    SELECT isbn, id, DATE(mark_time) AS tag_date, tag_state
    FROM tag NATURAL JOIN marks;

/* Rate */
CREATE OR REPLACE VIEW rate_view(isbn, id, rate_date, rating) AS
    SELECT isbn, id, DATE(mark_time) AS rate_date, rating
    FROM rate NATURAL JOIN marks;

/* Review */
CREATE OR REPLACE VIEW review_view(isbn, id, review_date, content) AS
    SELECT isbn, id, DATE(mark_time) AS review_date, content
    FROM review NATURAL JOIN marks;

/* General Marks */
CREATE OR REPLACE VIEW mark_book_view(isbn, title, id, mark_time, operation_name) AS
    SELECT isbn, title, id, mark_time::TIMESTAMP(0) AS mark_time, (
        CASE
            WHEN operation = 1 THEN 'bought'
            WHEN operation = 2 THEN 'tagged'
            WHEN operation = 3 THEN 'reviewed'
            WHEN operation = 4 THEN 'rated'
        END
    )
    FROM marks NATURAL JOIN books
    ORDER BY mark_time DESC;
