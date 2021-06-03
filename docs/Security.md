# Security

---

## App User Vs. Database User

这里我们选择对于所有的 miner, 统一使用一个 database user/role *miner* 来操纵数据库, 而不一一注册 database user, 原因如下

* 所有 miners 的权限应该是一样的, 因此无需注册多个 database users
* 如果这个 app 面对的是大量用户, 那么同时保留 database users 信息和 app users 信息会造成信息冗余
* 最重要的是, 我们这里没有采用**superuser 统一注册用户**的机制, 意味着如果我们要在用户自行注册时创建 database user, 我们需赋予 tourist `CREATEROLE` 的权限, 但是这个权限同时包括了 `ALTER` 和 `DROP` roles, 这会严重影响数据库的安全性

总而言之, 不注册 database users 一样有 authentication 环节, 用户一样用特殊的 database role *miner* 来操纵数据库, 而且这样比 superuser 统一建立用户更加灵活.