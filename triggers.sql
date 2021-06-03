/*! VIEW FIRST */
/* Rating trigger
   auto calculate the user rating after any insertion into table rate */
CREATE FUNCTION cal_u_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET (u_rating, u_num) = (
        SELECT AVG(rating) AS u_rating, COUNT(*) AS u_num
        FROM rate NATURAL JOIN (
            SELECT mark_id
            FROM marks
            WHERE isbn = NEW.isbn AND operation = 4
        ) AS r
    )
WHERE schoolCard.CNO = NEW.CNO;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
/* Then create the trigger */
CREATE TRIGGER auto_deduct AFTER INSERT ON foodConsume
FOR EACH ROW
EXECUTE PROCEDURE deduct_remainingSum();