/**
 * 4 triggers
 * 1. update_sold
 * 2. update_u_rating
 * 3. update_request_state
 * 4. delete_requested_book
 *
 * First two for update the book info once someone bought it or rated it.
 * Last two for update the requests info.
 */ 

/**
 * Sold trigger
 * auto update the book sales number after any purchase
 */
CREATE OR REPLACE FUNCTION cal_sold()
RETURNS TRIGGER AS $$
DECLARE isbn_in CHAR(13);
BEGIN
    /* get the isbn of the book involved in the new mark */
    SELECT isbn 
    INTO isbn_in
    FROM marks
    WHERE mark_id = NEW.mark_id;

    /* Update the sold info of the book */
    UPDATE books
    SET sold = sold + NEW.bought_num
    WHERE isbn = isbn_in;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
/* trigger */
CREATE TRIGGER update_sold AFTER INSERT ON buy
FOR EACH ROW
EXECUTE PROCEDURE cal_sold();

/**
 * Rating trigger
 * auto calculate the user rating after any insertion into table rate
 */
CREATE OR REPLACE FUNCTION cal_u_rating()
RETURNS TRIGGER AS $$
DECLARE isbn_in CHAR(13);
BEGIN
    /* get the isbn of the book involved in the new mark */
    SELECT isbn 
    INTO isbn_in
    FROM marks
    WHERE mark_id = NEW.mark_id;

    /* Update the rating info of the book */
    UPDATE books
    SET (u_rating, u_num) = (
        SELECT AVG(rating) AS u_rating, COUNT(*) AS u_num
        FROM rate_view
        WHERE isbn = isbn_in
    )
    WHERE isbn = isbn_in;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
/* trigger */
CREATE TRIGGER update_u_rating AFTER INSERT ON rate
FOR EACH ROW
EXECUTE PROCEDURE cal_u_rating();

/**
 * Request State Trigger
 * auto change the request state after any new book is added into table books
 * if that book is requested
 */
CREATE OR REPLACE FUNCTION change_request_state()
RETURNS TRIGGER AS $$
BEGIN
    /* Change the request state if the newly added book is in the requests */
    UPDATE request
    SET request_state = 2
    WHERE isbn = NEW.isbn;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
/* trigger */
CREATE TRIGGER update_request_state AFTER INSERT ON books
FOR EACH ROW
EXECUTE PROCEDURE change_request_state();

/**
 * Requested Book Trigger
 * auto remove the information of a requested book after 
 * the request state of that book is changed to "added" or "turned down"
 */
CREATE OR REPLACE FUNCTION delete_requested_book_fun()
RETURNS TRIGGER AS $$
BEGIN
    /* remove the requested book if its request state
    is changed to "added" or "turned down" */
    DELETE FROM requested_books
    WHERE isbn = NEW.isbn AND NEW.request_state IN (2,3) ;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
/* trigger */
CREATE TRIGGER delete_requested_book AFTER UPDATE ON request
FOR EACH ROW
EXECUTE PROCEDURE delete_requested_book_fun();