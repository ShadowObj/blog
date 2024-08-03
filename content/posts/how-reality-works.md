+++
title = 'Xray的Reality如何突破白名单? 兼谈基于TLS的规避工具发展历程'
date = 2024-07-31T00:00:00+08:00
draft = true
tags = ["反审查","SNI白名单","TLS","加密代理"]
categories = ["反审查","TLS"]
+++

### ℹ️前言
主要由RPRX和yuhan维护的Xray，又称Project X，是一个开源的具有规避工具，在反审查领域中以其新颖前卫而实用的各种概念性技术 ~~还有曾经神秘失踪的开发者RPRX~~ 而闻名，像是VLESS,XTLS-Vision,XUDP...

而自从中国大陆一些地区(已知福建泉州移动是最早的地区)开始实施一种全新的审查策略--**SNI白名单**，基于TLS的各种规避工具在那里一夜之间变得不可用。先前ihciah开发的规避工具shadowtls得到广泛关注，这一项目或许就是RPRX开发**Reality**并将其集成到Xray中的灵感之一。Reality因为可以**突破SNI白名单**，在反审查领域名声大噪。

那么Reality是如何突破这一审查策略的? 从技术角度如何理解其细节? 这两个问题将是本文接下来探讨的重点。同时，本文也将为读者梳理其他被广泛使用(过)的、基于TLS的规避工具的发展历程。

(小插曲: shadowtls有v1,v2,v3三个不相兼容的版本，其中v2修复了v1存在的可审查漏洞，见论文 [Chasing Shadows: A security analysis of the ShadowTLS proxy](https://www.petsymposium.org/foci/2023/foci-2023-0002.pdf)，当然这都是后话了，未来可能会出一期文章讲shadowtls)

### 👀 "SNI白名单"是什么? SNI和TLS是什么关系?
你可能知道，现在广泛使用的应用层安全协议，HTTPS的基石——TLS协议在发起连接时有自己的"握手流程"。什么? 你不知道"握手"是啥? 你可以看看我的往期文章 "[流量分类识别加密代理? 初探TLS in Any问题](/posts/what-is-tls-in-any/)" 中的[这一段](/posts/what-is-tls-in-any/?highlight=what-is-tls-handshake-hl)。

在理解**SNI白名单**这种审查策略之前，我们先来看看一个正常TLS1.3连接的握手流程:<br />
(这里引用一张来自Cloudflare Blog的图片，版权归Cloudflare lnc.所有。)
![](/img/how-tls-13-handshakes-cloudflare.png)
Q:为什么选择TLS1.3作例子?<br />
A: 因为TLS1.3很大程度上就是TLS1.2简化后的版本，它修复了前代的诸多安全漏洞、设计得更加简洁好用，并且其部署规模正在不断扩大。

### 🤔 我们来想想如何改变SNI
###  🔍 Shall we go into the sea of code?
这一节我们试试深入Reality的源代码，结合第一节的知识，一行行地解析Reality实现"修改SNI"以规避审查的技术细节。
请先别走! 不论你是编程新手、还是开发小白，我都会用**平常易懂的自然语言**，仔细地解释这一节出现的所有代码的作用。请记住: **看懂程序是看懂设计思路，不是看懂编程语言知识**。
如果你是开发老鸟，也请不要纠结于一些编程细节，比如数据类型，这对于你在这篇文章之内理解Reality的设计无益。
### 基于TLS规避审查这条路上，发生过什么

*(推荐相关阅读 : )*
1. [A Detailed Look at RFC 8446 (a.k.a. TLS 1.3) - Cloudflare Blog](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)