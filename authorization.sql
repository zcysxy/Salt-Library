/* Create Roles */
CREATE ROLE miner LOGIN PASSWORD 'miner';

/* Authorization */
/* Tourist/public privileges */
GRANT SELECT
ON books, tag, rate, review, tag_view, rate_view, review_view
TO public;

GRANT SELECT
ON marks
TO public;

GRANT SELECT-- (ID, password)
ON miners
TO public;

GRANT INSERT
ON miners
TO public;

/* Miner privileges */
GRANT UPDATE
ON miners, tag
TO miner;

GRANT ALL
ON cart
TO miner;

GRANT SELECT
ON marks, buy, tag, request, requested_books, mark_book_view, buy_view
TO miner;

GRANT USAGE, SELECT
ON SEQUENCE marks_mark_id_seq
TO miner;

GRANT INSERT
ON marks, buy, requested_books, request, tag, rate, review
TO miner;

GRANT DELETE
ON tag, rate, review
TO miner;

GRANT UPDATE (u_rating, u_num)
ON books
TO miner;