+++
title = "本站修复后台成功"
date = 2025-05-24
tags = []
+++

自从上次迁移站点后，发现后台一直**将您重定向的次数过多，**在历经2个小时后（没有经验，穷举法），一路检测主题，插件，数据库后，最后发现是因为WordPress网站管理后台没有开启对https的支持，最后在wp-config.php添加三行解决完成;)

```
$_SERVER['HTTPS'] = 'on';
define('FORCE_SSL_LOGIN', true);
define('FORCE_SSL_ADMIN', true);
```