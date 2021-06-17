# 原始 SQL

[[Report]]

---

/& Page

此部分对应的页面信息为

* Page title: SQL
* Route: `/sql`

&/

/+ Code

此部分对应的代码为

* `curator.py` 中的 `sql()` 函数
* `sql.html`

+/

原始 SQL 查询 (Raw SQL Query) 是本应用的一个 "彩蛋" 功能, 它其实就是直接调用类 `Connect` 的 `.query()` 方法将馆长输入的 SQL query 传递给数据库, 然后以表格的形式展示查询结果, 或直接显示错误信息. 例子如下

![](img/sql-1.png)
:> 输入 SQL 有语法错误时, 直接显示 PSQL 的错误信息 <:

![](img/sql-2.png)
:> 以表格的形式呈现查询结果 <:

- [ ] 这个功能虽然简单