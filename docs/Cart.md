# Cart

[[Functions]]

page:: [[book]] | [[cart]]

---

包括加入购物车和移除购物车

## Code

```sql
INSERT INTO cart VALUES (%s, %s, %s)
ON CONFLICT (isbn, id)
DO UPDATE SET cart_num = cart.cart_num + EXCLUDED.cart_num
```

