+++
title = 'Stand Togerther: Anti-Censorship Technical Community and Media Collection (Continuously Updated)'
description = "Welcome to make a recommendation in the comment section! Updated on 2024-08-29" 
date = "2024-08-10 13:00:00+08:00" 
lastmod = "2024-08-29 18:00:00+08:00" 
draft = false
tags = ["Anti-censorship", "academic", "site"]
categories = ["Anti-censorship", "collection"]
keywords = ["Anti-censorship","xtls","v2ray","xray","collection","fanqiang","ladder","proxy"]
nonRSS = false
#lastmod = "" 
#wordCount = true
#fuzzyWordCount = true
#viewsCount = true
#readingTime = true
#wordNumber = 0
#readingNumber = 0
mobileOptimize = true
+++

Here are a few to collect **Anti-censorship is relevant and neutral** links to technical communication communities, auditing platforms, past research, academic conferences, circumvention tools (homepage), and anti-censorship Internet media for Chinese readers and their introductions hope to provide readers with as many trusted sources of information as possible.

Anyone is welcome to recommend relevant websites/tools in the comment section! When recommending, please include a link to the website and the reason for the recommendation. <br />**NOT accepting anti-censorship internet media with non-neutral political stances or promoting false information.**

*(Last Updated: 2024-08-29)*

### 🔗 Technical Exchange Community
  - net4people/bbs https://github.com/net4people/bbs/issues/

A multilingual anti-censorship community built on the issues feature of Github, a repository hosting platform.

  - ntc.party (**N**o **T**hought is a **C**rime) https://ntc.party/

Multilingual Anti-Censorship Internet Forum. Mostly in Russian.

### 🪜 Circumvention tools

(All of the circumvention tools listed here are open source or have at least one open source implementation available.) )

  - Tor Project  https://www.torproject.org/

The first public anti-censorship project to be launched. It is also the greatest and most widely known anti-censorship project to date. Since 2006, The Tor Project, Inc., a 501(c)(3) non-profit organization, has been operating for free on the global Internet. The Tor Project is committed to promoting human rights and freedoms by giving all Internet users the right to access uncensored websites privately.

  - Shadowsocks  https://github.com/shadowsocks/shadowsocks-rust/

(👆 The link points to the Rust implementation of the Shadowsocks protocol, both client and server)

Circumvention tools with great influence in the field of Chinese anti-censorship technology, by:[clowwindy](https://github.com/clowwindy/) create. Later, due to force majeure factors, the original author stopped maintenance. It is one of the pioneers of circumvention tools using fully encrypted protocols.

  - Outline  https://github.com/Jigsaw-Code/outline-apps/

A shadowsocks-based evasion tool developed by Google Jigsaw. It provides a graphical cross-platform operation interface for both the client and the server.

  - V2ray-core  https://github.com/v2fly/v2ray-core/

Organized by the community [V2Fly](https://github.com/v2fly/) maintenance. The first circumvention tool in the field of Chinese anti-censorship technology that includes many different transmission methods. Pioneered the inbound -> routing -> outbound traffic evasion mode. It has great influence in the field of Chinese anti-censorship technology.

  - Xray-core  https://github.com/XTLS/Xray-core/

A fork of V2ray-core, consisting of [RPRX](https://github.com/rprx/) create. On the basis of the original project, XTLS, REALITY, XUDP, fallbacks and other functions have been developed. It has great influence in the field of Chinese anti-censorship technology.

  -Hysteria  https://github.com/apernet/hysteria/

composed [Aperture Internet Laboratory](https://github.com/apernet/) create a circumvention tool, based on a custom QUIC protocol. There are two incompatible versions, v1 and v2. In the field of Chinese anti-censorship technology, it is known for the Brutal congestion control mechanism.

⚠️ Note: Unfortunately, it will be held on July 15-18, 2024 [The Third Plenary Session of the 20th CPC Central Committee](https://zh.wikipedia.org/wiki/中国共产党第二十届中央委员会第三次全体会议) during this period, there were spontaneous reports of users blocking UDP-based evasion tools in Chinese mainland ([link](https://linux.do/t/topic/136940/3) from the LinuxDo forum). QUIC is a UDP-based network layer protocol.
    
  - sing-box  https://github.com/SagerNet/sing-box/

composed [SagerNet](https://github.com/SagerNet) A common proxy platform created. Go implementation with many circumvention tools. Free and open source graphics clients have been developed for both Android and all Apple platforms.

  - GoodbyeDPI  https://github.com/ValdikSS/GoodbyeDPI/

composed [ValdikSS](https://github.com/ValdikSS) serverless DPI circumvention tool created. It contains a series of evasion methods for anti-DNS poisoning, DNS preemptive answering, plaintext HTTP detection, SNI detection (SNI blacklist) and other censorship strategies. Only runs on Windows 7/8/8.1/10/11.
    
⚠️ Note: GoodbyeDPI is an experimental tool with significant technical limitations that may result in more obvious observability characteristics of evasive traffic. Its concealment and reliability **Doubt** moreover **There is no circumvention of it** iP-based censorship policies.

  - Sheas Cealer  https://github.com/SpaceTimee/Sheas-Cealer/

composed [Space Time](https://github.com/SpaceTimee/) A lightweight serverless DPI circumvention tool created. SNI-based censorship policies can be circumvented by telling the browser to modify the value of the SNI field in the TLS ClientHello destined for the specified domain. The principle is similar [Domain Prepend](https://zh.wikipedia.org/wiki/%E5%9F%9F%E5%89%8D%E7%BD%AE)。 The tool also maintains a comprehensive list of domain names-legal SNI-available IP mappings.
    
⚠️ Note: Sheas Cealer is an experimental tool that can break the authentication, stealth, and reliability of TLS **Doubt**.There are significant limitations to the circumvention technique of "domain fronting", and **There is no circumvention of it** iP-based censorship policies.
(As of 2024-08-29, three large CDN providers, including Cloudflare/AWS Cloudfront/Fastly, have disabled "domain fronting.") )

### 🔍 Audit platform

  - Censored Planet  https://censoredplanet.org/

The review measurement platform, built by a team of students from the Computer Science and Engineering Department at University of Michigan, uses a variety of remote measurement techniques to collect audit-related data in more than 200 countries. Its founding team has developed the measurement technologies such as Augur, Satellite, Quack, Hyperquack, etc., which are being used on the platform.

  - Google Jigsaw  https://jigsaw.google.com/

Jigsaw is a division within Google that explores the threats facing open societies and develops technologies for scalable solutions. He is also the creator and developer of Outline, a well-known Shadowsocks-compatible open-source circumvention tool. In addition to this, it is also working to identify and confront emerging issues that threaten open societies, from censorship and harassment to disinformation and violent extremism.

  - OONI (**O** pen **O** bservatory of **N** etwork **I** nterference)  https://explorer.ooni.org/zh-CN/

(👆 The link points to the Chinese version of the platform's homepage)

Also known as OONI Explorer, known as the "Open Observatory for Internet Intervention" in Chinese, is an open data resource that aims to document Internet censorship around the world. Since 2012, millions of network measurements have been collected in more than 200 countries. Slogan stands for "exposing the evidence of Internet censorship around the world".

  - The Citizen Lab  https://citizenlab.ca/

Named "Citizen Lab" in Chinese, it is an academic research laboratory headquartered in Munch College, University of Toronto, Canada. Focuses on digital threats to civil society, human rights, and global security with high-level policy and legal involvement. The research spans a wide range of fields, including political science, law, computer science, and geopolitics. For more information, see https://citizenlab.ca/about/.

### 📖 Academic conferences
  - USENIX Security  https://www.usenix.org/conference/usenixsecurity24/

(👆 Link to The 2024 of the Year.)**33rd USENIX Security Symposium**, 33rd USENIX Security Conference, as of the last update has not officially begun)
    
The USENIX Security Symposium is held annually by the non-profit organization USENIX. Founded in 1975, the organization is known for organizing conferences and publishing research. Among the well-known conferences and events under his name are: USENIX Operating System Design and Implementation Conference (OSDI), USENIX Network System Design and Implementation Conference (NSDI), USENIX Security Conference (USENIX Security), USENIX Annual Technical Conference (ATC), USENIX File and Storage Technology Conference (FAST), which has a great influence on all aspects of research in the field of computing worldwide.
    
  -FOCI (**F** ree and **O** pen **C** ommunications on the **I** nternet)  https://foci.community/

An academic research community led by Censored Planet. Unlike USENIX Security, the community focuses more on aggregating the opinions and research results of researchers, implementers (developers) and activists in the Internet field, taking a holistic, interdisciplinary perspective on the control of online speech and how to circumvent it.

  - PETS (**P** rivacy **E** nhancing **T** echnologies **S** ymposium)  https://petsymposium.org/

In Chinese, it is called "Privacy Enhancement Technology Seminar" and is held every year. PETS brings together privacy experts from around the world to present and discuss the latest advances and new perspectives in privacy technology research. The conference is affiliated with an academic open access journal called PoPETs for timely publication of research papers on privacy while retaining the highly successful PETS community activities.

### 📰 Chinese Internet media

  - 中国数字时代  https://chinadigitaltimes.net/chinese/

(👆 The link points to the Chinese version of the media homepage)
    
China Digital Times, or CDT for short, is dedicated to collecting, recording, organizing, analyzing, and disseminating censored information on the Chinese Internet, as well as people's efforts to combat political censorship; and thus to focus on broader topics of freedom, human rights, democracy and the rule of law. Politically neutral.

  - 有据 |International News Fact Checking https://chinafactcheck.com/

The first independent fact-checking program for the Chinese Internet, focusing on verifying international information about the Chinese world. Initiated in the form of a network collaboration program based on the principle of volunteerism, with no operational entity.**Opinion is not verified, only facts are verified.** 

  - 低音 |Voice the voiceless  https://diyin.org/

Bass is a non-profit, independent media outlet dedicated to giving voice to people and issues that have been overlooked. "Bass" is taken from the media's founding goal: "We want to send out the bass of the times and live with the world in a different way". The bass's biggest highlight is its "Refuse to Forget" section, which focuses on telling the people and stories that have been forgotten. The political stance is relatively neutral.