+++
title = '风雨同舟: 反审查技术交流社群与媒体收集 (持续更新)'
description = "欢迎在本文评论区提出推荐! 2024-08-29更新"
date = "2024-08-10 13:00:00+08:00"
lastmod = "2024-08-29 18:00:00+08:00"
draft = false
tags = ["反审查", "学术", "网站"]
categories = ["反审查", "收集"]
keywords = ["反审查","xtls","v2ray","xray","集合","搜集","收集","研究","翻墙","梯子","代理","机场"]
nonRSS = false
#lastmod = ""
#wordCount = true
#fuzzyWordCount = true
#viewsCount = true
#readingTime = true
#wordNumber = 0
#readingNumber = 0
narrowScreenOpt = true
+++

这里收集一些**反审查相关且中立**的技术交流社群、审计平台、过往研究、学术会议、规避工具(主页)、以及面向中文读者的反审查互联网媒体的链接及其简介，希望能够为读者提供尽可能多的可信信息源。

欢迎任何人在评论区推荐相关网站/工具! 推荐时请附上 网站链接、推荐理由。<br />**不接收政治立场非中立或宣传虚假信息的反审查互联网媒体，望见谅。**

*(最后更新于: 2024-08-29)*

### 🔗技术交流社群
  - net4people/bbs https://github.com/net4people/bbs/issues/

    以代码库托管平台Github的issues功能建立起的多语言反审查交流社区。

  - ntc.party (**N**o **T**hought is a **C**rime) https://ntc.party/

    多语言反审查互联网论坛。以俄语内容为多。
  
### 🪜规避工具

  ​	(此处列出的所有规避工具均开源或有至少一个可用的开源实现。)

  - Tor Project  https://www.torproject.org/

    最早启动的公众反审查项目。也是迄今为止最伟大的、最广为人知的反审查项目。自2006年起，由501(c)(3)非盈利组织 The Tor Project, Inc. 面向全球互联网免费运行至今。Tor Project致力于让所有互联网用户拥有私人访问未经审查的网站的权利，以此促进人权和自由。

  - Shadowsocks  https://github.com/shadowsocks/shadowsocks-rust/

    (👆链接指向的是shadowsocks协议的rust实现，包括客户端和服务器)

    在中文反审查技术领域影响力巨大的规避工具，由[clowwindy](https://github.com/clowwindy/)创建。后因不可抗力因素，原作者停止维护。是规避工具使用全加密协议的先驱之一。

  - Outline  https://github.com/Jigsaw-Code/outline-apps/

    由Google Jigsaw开发的基于shadowsocks协议的规避工具。为客户端和服务器都提供了图形化的跨平台操作界面。

  - V2ray-core  https://github.com/v2fly/v2ray-core/

    由社区组织 [V2Fly](https://github.com/v2fly/) 维护。中文反审查技术领域第一个包含较多不同传输方式的规避工具。开创了 入站 -> 路由 -> 出站 的规避流量传输模式。在中文反审查技术领域影响力较大。

  - Xray-core  https://github.com/XTLS/Xray-core/

    V2ray-core的一个分支，由[RPRX](https://github.com/rprx/)创建。在原项目的基础上开发了XTLS, REALITY, XUDP, fallbacks等功能。在中文反审查技术领域影响力较大。

  - Hysteria  https://github.com/apernet/hysteria/

    由 [Aperture Internet Laboratory](https://github.com/apernet/) 创建的规避工具，基于自定义的QUIC协议。共有v1和v2两个不相兼容的版本。在中文反审查技术领域以 Brutal 拥塞控制机制而闻名。

    ⚠️注意: 很不幸，在2024年7月15日至18日中共举行[第二十届三中全会](https://zh.wikipedia.org/wiki/中国共产党第二十届中央委员会第三次全体会议)期间，中国大陆出现了基于UDP的规避工具遭到大规模封锁的用户自发报告([链接](https://linux.do/t/topic/136940/3)来自LinuxDo论坛)。QUIC正是一种基于UDP的网络层协议。
    
  - sing-box  https://github.com/SagerNet/sing-box/

    由 [SagerNet](https://github.com/SagerNet) 创建的通用代理平台。包含许多规避工具的Go实现。同时为Android和所有Apple平台开发了免费开源的图形客户端。

  - GoodbyeDPI  https://github.com/ValdikSS/GoodbyeDPI/

    由 [ValdikSS](https://github.com/ValdikSS) 创建的无服务器DPI规避工具。包含一系列用于对抗DNS投毒、DNS抢答、明文HTTP检测、SNI检测(SNI黑名单)等审查策略的规避方法。仅在Windows 7/8/8.1/10/11上运行。
    
    ⚠️注意: GoodbyeDPI 属于实验性工具，存在显著的技术局限性，可能使规避流量产生更明显的可观测特征。其隐蔽性与可靠性**存疑**，且**无法规避**基于IP的审查策略。

  - Sheas Cealer  https://github.com/SpaceTimee/Sheas-Cealer/

    由 [Space Time](https://github.com/SpaceTimee/) 创建的轻量无服务器DPI规避工具。通过告知浏览器修改发往指定域的 TLS ClientHello 中的SNI字段的值，可以规避基于SNI的审查策略。原理类似于 [“域前置”](https://zh.wikipedia.org/wiki/%E5%9F%9F%E5%89%8D%E7%BD%AE)。该工具同时维护了一份完善的 域名-合法SNI-可用IP 映射列表。
    
    ⚠️注意: Sheas Cealer 属于实验性工具，可能破坏 TLS 的认证机制，隐蔽性与可靠性**存疑**。“域前置”这一规避技术存在显著局限性，且**无法规避**基于IP的审查策略。
    (截至2024-08-29, Cloudflare/AWS Cloudfront/Fastly等三个大型CDN提供商均禁用"域前置"。)

### 🔍审计平台

  - Censored Planet  https://censoredplanet.org/

    由来自Computer Science and Engineering Department at University of Michigan，美国密歇根大学的计算机科学与技术系，的学生团队建立的审查测量平台，使用多种远程测量技术在200多个国家收集审查相关数据。其创建团队开发了该平台正在使用的Augur, Satellite, Quack, Hyperquack等测量技术。

  - Google Jigsaw  https://jigsaw.google.com/

    Jigsaw是Google内部的一个部门，致力于探索开放社会面临的威胁，并开发可扩展解决方案的技术。同时也是著名的Shadowsocks兼容的开源规避工具, Outline, 的创建者和开发商。除此之外，也致力于识别和对抗威胁开放社会的新兴问题，从审查和骚扰到虚假信息和暴力极端主义。

  - OONI (**O**pen **O**bservatory of **N**etwork **I**nterference)  https://explorer.ooni.org/zh-CN/

    (👆链接指向的是该平台主页的中文版本)

    又称OONI Explorer，中文名为"网络干预开放观察站"，是一个旨在记录全世界互联网审查的开放数据资源库。自2012年以来，已在超过200个国家收集了数以百万的网络测量数据。Slogan为"揭露全世界互联网审查的证据"。

  - The Citizen Lab  https://citizenlab.ca/

    中文名为"公民实验室"，是一个学术研究实验室，总部设在加拿大多伦多大学蒙克学院。专注于研究有高级别政策和法律参与的，对于公民社会、人权和全球安全的数字威胁。调查研究跨度大、范围广，包括政治学，法学，计算机科学和地缘政治。详细介绍见 https://citizenlab.ca/about/.

### 📖学术会议
  - USENIX Security  https://www.usenix.org/conference/usenixsecurity24/
  
    (👆链接指向2024年度的The **33rd USENIX Security Symposium**，第三十三届USENIX安全会议，截至最后一次更新尚未正式开始)
    
    USENIX Security Symposium由非营利组织USENIX每年举行。该组织创办于1975年，以组织会议和发表研究而闻名。其名下著名的会议活动有: USENIX操作系统设计与实现会议(OSDI)，USENIX网络系统设计和实现会议(NSDI)，USENIX安全会议(USENIX Security)，USENIX年度技术会议(ATC)，USENIX文件和存储技术会议(FAST)，对于世界范围内的计算机领域各方面研究的影响力巨大。
    
  - FOCI (**F**ree and **O**pen **C**ommunications on the **I**nternet)  https://foci.community/

    由Censored Planet主导的学术研究社区。不同于USENIX Security，该社区更加注重聚合来自互联网领域的研究人员、实施者(开发者)和活动家的意见和研究成果，采用整体的、跨学科的视角研究对于网络言论的控制及其规避方法。

  - PETS (**P**rivacy **E**nhancing **T**echnologies **S**ymposium)  https://petsymposium.org/

    中文名为"隐私增强技术研讨会"，每年举行。PETS汇集了来自世界各地的隐私专家，介绍和讨论隐私技术研究的最新进展和新观点。该会议附属一个名为PoPETs的学术性的开放获取期刊，用于及时发表关于隐私的研究论文，同时保留非常成功的PETS社区活动。
  
### 📰中文互联网媒体

  - 中国数字时代  https://chinadigitaltimes.net/chinese/

    (👆链接指向的是该媒体主页的中文版本)
    
    英文名为China Digital Times，简称CDT，致力于收集、记录、整理、分析和传播中文互联网上被审查的信息，以及人们对抗政治审查的努力；并由此关注更广泛的自由、人权、民主和法治话题。政治立场中立。
    
  - 有据 | 国际新闻事实核查  https://chinafactcheck.com/
  
    面向中文互联网的首个独立的事实核查计划，专注于核查中文世界的国际资讯。以一个基于志愿原则的网络协作计划的形式发起，没有运作实体。**不核查观点，只核查事实。**
  
  - 低音 | Voice the voiceless  https://diyin.org/
  
    “低音”是一家非盈利的独立媒体，致力于为那些被忽视的社会人群和议题发声。“低音”取自该媒体的建立目标: "我们希望发出时代的低音，用不一样的方式与这个世界共处"。低音最大的亮点是其“拒绝遗忘”栏目，该栏目注重讲述那些被遗忘的人和故事。政治立场较为中立。
