# Fuzzy Search

[[Functions]]

Page:: [[home]] | [[search_result]]

---

## Code

```python
like_title = '%' + '%'.join(request.args.get('title')) + '%'
```

```sql
SELECT *
FROM books
WHERE title LIKE %s
```