# Relational Schemas

#todo 

---

这里我们给出我们的数据库模式表 relational schemas.

$$\begin{aligned}
&books (\underline{ISBN}, title, author, publisher, publish\_year, pulish\_month, price, rating, sold)\\
&miners ()\\
&requested\_books (\underline{ISBN}, title, author, publisher, publish\_year, pulish\_month, price)\\
&request (\underline{ISBN}, \underline{ID}, request\_time, request\_state)\\
&cart (\underline{ISBN}, \underline{ID}, cart\_num)\\
&marks (\underline{mark\_id},ISBN, ID, mark\_time, operation)\\
&buy (\underline{mark\_id}, bought\_num)\\
&tag (mark\_id, \underline{ISBN}, \underline{ID}, tag\_state)\\
&review (mark\_id, \underline{ISBN}, \underline{ID}, content)\\
&rate (\underline{mark\_id}, rating)
\end{aligned}$$

## Normal Forms

现在我们证明我们的数据库模型的合理性.

模型满足第一范式是显然的, 尤其是当我们将复合属性 *publish_date* 拆分为 *publish_year* 和 *publish_month* 之后. 同时值得一提的是, 我们不关心用户的邮箱和电话的各部分代表的信息 (如电话地区等), 因此将它们的域视为原子域是合理的.

/[ Rewrite #todo 

其次, 本模型除主键和外键限制以外没有明显的特殊函数依赖, 因此很难谈第三范式, BCNF 等范式. 有人可能会质疑本模型有大量的**冗余**信息, 因为 *ISBN* 和 *ID* 几乎在所有表中都出现了, 但事实上这完全是错误的理解, 理由如下

1. 本模型是典型的**关系型数据库**, 即实体多为关系, 更具体地, books 与 miners 之间的关系. 因此 *ISBN* 和 *ID* 作为这些关系的主键是绝对必要的
2. 同时不同的关系的 *ISBN*, *ID* 对是**独立的**, 如一个人对一本书标记状态和他将这本书加入购物车是两个完全无关的动作, 因此即使两个动作有同样的 *ISBN*, *ID* 对, 这也不是冗余
3. 本模型使用了大量的**无交 ISA 关系**, 它并不是增加冗余性的分解操作. 因为将 ISA 关系的所有低层级表合并为一个高层极表, 其中的记录的数量是不变的, 这与分解后再做连接有本质的区别. 此外这些 ISA 关系还能有效减少空值 null 的出现, 降低数据库的维护难度

]/