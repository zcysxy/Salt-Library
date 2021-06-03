/* Buy procedure
    1. Insert tuples into *marks*
    2. Insert tuples into *buy*
    3. Remove tuples from *cart*
*/
CREATE OR REPLACE PROCEDURE buying(IN id_in VARCHAR)
AS $$
BEGIN
    WITH
		buy_info(isbn, id, bought_num, operation, buy_time) AS (
			SELECT isbn, id, cart_num, 1, CURRENT_TIMESTAMP FROM cart WHERE id=id_in
		),
		r AS (
            INSERT INTO marks(isbn, id, operation)
                (SELECT isbn, id, operation FROM buy_info)
                RETURNING mark_id, isbn
        )

    INSERT INTO buy(mark_id, bought_num)
        (SELECT r.mark_id, bought_num FROM r NATURAL JOIN buy_info);

    DELETE FROM cart
    WHERE id=id_in;
END;
$$ LANGUAGE plpgsql;

/* Tag procedure
    1. Delete the original tuple from *tag* if exists
    2. Insert a tuple into *marks*
    3. Insert a new tuple into *tag*
*/
CREATE OR REPLACE PROCEDURE tagging(isbn_in CHAR(13), id_in VARCHAR, state_in INT)
AS $$
DECLARE new_mark_id INT;
BEGIN
    /* If there is a previous tag state, delete it */
    DELETE FROM tag
    WHERE mark_id IN (
        /* Fetch the newest tag state */
        SELECT mark_id
        FROM marks
        WHERE isbn=isbn_in AND id=id_in AND operation=2
    );

    /* Insert a new mark */
    INSERT INTO marks(isbn, id, operation) VALUES
        (isbn_in, id_in, 2)
        RETURNING mark_id INTO new_mark_id;

    /* Insert a new tag */
    INSERT INTO tag VALUES (new_mark_id, state_in);
END;
$$ LANGUAGE plpgsql;

/* Rate procedure
    1. Delete the original tuple from *rate* if exists
    2. Insert a tuple into *marks*
    2. Insert a new tuple into*rate*
*/
CREATE OR REPLACE PROCEDURE rating(isbn_in CHAR(13), id_in VARCHAR, rating_in INT)
AS $$
DECLARE new_mark_id INT;
BEGIN
    /* If there is a previous rating, delete it */
    DELETE FROM rate
    WHERE mark_id IN (
        /* Fetch the newest rating */
        SELECT mark_id
        FROM marks
        WHERE isbn=isbn_in AND id=id_in AND operation=4
    );

    /* Insert a new mark */
    INSERT INTO marks(isbn, id, operation) VALUES
        (isbn_in, id_in, 4)
        RETURNING mark_id INTO new_mark_id;

    /* Insert a new rating */
    INSERT INTO rate VALUES (new_mark_id, rating_in);
END;
$$ LANGUAGE plpgsql;

/* Review procedure
    1. Delete the original tuple from *review* if exists
    2. Insert a tuple into *marks*
    2. Insert a new tuple into *review*
*/
CREATE OR REPLACE PROCEDURE reviewing(isbn_in CHAR(13), id_in VARCHAR, content_in VARCHAR)
AS $$
DECLARE new_mark_id INT;

BEGIN
    /* If there is a previous review, delete it */
    DELETE FROM review
    WHERE mark_id IN (
        /* Fetch the newest review */
        SELECT mark_id
        FROM marks
        WHERE isbn=isbn_in AND id=id_in AND operation=3
    );

    /* Insert a new mark */
    INSERT INTO marks(isbn, id, operation) VALUES
        (isbn_in, id_in, 3)
        RETURNING mark_id INTO new_mark_id;

    /* Insert a new rating */
    INSERT INTO review VALUES (new_mark_id, content_in);
END;
$$ LANGUAGE plpgsql;