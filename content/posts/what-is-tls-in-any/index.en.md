+++
title = 'Traffic classification can detect encrypted proxies? A First Look at "TLS in Any" vulnerability'
description = "Traffic classification? What kind of unheard-of censorship strategy is this? How far away is it from us? Is TLS proxy still safe and hidden?"
date = "2024-07-31 16:00:00+08:00"
draft = false
tags = ["Anti-censorship","Traffic classification","TLS","Encrypted proxy"]
categories = ["Anti-censorship","TLS"]
#wordCount = true
#fuzzyWordCount = true
#viewsCount = true
#readingTime = true
#wordNumber = 7600
#readingNumber = 15
mobileOptimize = true
+++

(All the content below is translated from Chinese by Google Translate ↓)<br>
(Please feel free to make your own comments at the translation.)

📢First, answer the questions raised above:

1. Traffic classification refers to **passively** recording certain visible indicators of traffic without **destroying the original encryption and integrity of the data**, to determine certain characteristics of the source or destination of the traffic, such as what type of client is, what type of server is, and what purpose the traffic is for.

2. This censorship strategy is indeed unheard of; before the academic field proposed a censorship strategy based on traffic classification, people and censors focused on matching **specific location data** in the traffic with certain data sets, or observing **specific reactions** of the client/server to response carefully constructed data packets sent by the censor, in order to achieve the purpose of censorship (while developers and researchers of anti-censorship tools explore anti-censorship strategies in conjunction with network measurements, etc.).

3. TLS proxies are still **secure**, but as of the publication of this article, the concealment of all open source TLS proxies in use is **questionable** about in the experimental data of the [paper](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) mentioned below, including some proxy implementations that **use multiplexing**.

Note: Here we need to clarify the difference between "security" and "concealment". In the context of anti-censorship, security generally refers to the **plaintext invisibility** and **integrity** of data when it is transmitted in **untrusted channels** under current computing power conditions; while confidentiality generally refers to the **negative similarity** of data with **certain specific data** when it is transmitted in untrusted channels, as well as the **negative similarity** of the client and server with **certain specific implementations**.

Let's get into the main text.

The reason why I wrote this article is that I saw a paper titled "[Fingerprinting Obfuscated Proxy Traffic with Encapsulated TLS Handshakes](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting)" on [Censored Planet](https://censoredplanet.org/) at the beginning of this year, which also caused some discussion in the circumvention field, so I decided to study it carefully, hoping to explain some core concepts and the editor's own ideas to readers here. This blog was born for this article.

(Note: The "circumvention tools" referred to in this article refer to systems or protocols used to circumvent network censorship)

### ℹ️ Introduction
The currently widely recognized strategies for circumventing censorship can be abstractly summarized into two types:
1. Steganography: Make the traffic look like allowed traffic.
2. Polymorphism: Make the traffic look like no other traffic.

"Polymorphism" is the strategy adopted by a number of protocols such as shadowsocks. It means doing some encrypt, pad, reorder, to turn the network traffic into a random byte stream, in order to make sure that there is no plaintext in the traffic visible to the censor, and the censor cannot find a fixed regular expression to match, so as to avoid being identified and blocked.
(Note: In fact, the proportion of completely random traffic on the Internet is extremely low, so **randomness itself is just a feature**, which directly led to the use of **entropy-based rules** (here **entropy** means the randomness of data) by GFW *(the national level censor in mainland China)* to roughly detect and block circumvention tools such as shadowsocks, see the paper [How the Great Firewall of China Detects and Blocks Fully Encrypted Traffic](https://gfw.report/publications/usenixsecurity23/data/paper/paper.pdf). Of course, later developers of anti-censorship tools adopted designs such as padding to change entropy to circumvent this censorship strategy)

The **necessary prerequisite** for "steganography" is that there must be at least one type of allowed traffic, such as WeChat calls and TLS. The following paragraphs refer to this allowed traffic as "the protocol".

"Steganography" can be abstractly divided into two types:

1. Imitation: **pretend** to be a certain implementation of the protocol for transmission.

2. Tunneling: **direct** use a certain implementation of the protocol for transmission.

These two steganographic methods may not seem to be very different, but in fact they are very different. For example, "steganography" is like replacing the Mac icon pack on a Windows computer and using a simulated Mac desktop, but no matter how the underlying layer is Windows, it will never run Finder *(the official file manager of MacOS)*. "Tunneling" is like using a Mac directly, without any "flaws".

"Imitation" is widely believed to be impossible to be used to circumvent censorship, because when claiming to be a certain implementation of the protocol, the various different reactions, implementation quirks and even bugs of the implementation must be implemented, otherwise the censor can distinguish between normal traffic and circumvention traffic by confirming whether the implementation has these details that should be there. For the developers of circumvention tools, common implementations are often very complex and it is impossible to achieve perfect imitation. If the circumvention tool imitates a simple implementation, often the simple implementation itself is not common enough, and they will be blocked by the censors. The paper [The Parrot Is Dead: Observing Unobservable Network Communications](https://ieeexplore.ieee.org/document/6547102) analyzes this vulnerability more carefully and in detail.

Therefore, "Tunneling" has become a widely used steganographic method in circumvent tools. It calls the interface provided by a common implementation, passes the data to this interface, and the circumvent traffic is encapsulated and transmitted by the implementation. All the widely used TLS-based evasion tools now belong to this type of "steganography".

### 🔍 What causes the "TLS in Any" vulnerability?
The reason why traffic is called traffic, is that traffic is composed of a series of data packets within a connection, and these data packets have their own size and sequence. <text class="what-is-tls-handshake-hl">At the beginning of each type of traffic, there are usually several data packets that follow specific specifications to meet specific needs. These data packets are called **"handshake packets"**.</text> WeChat calls have their own handshake packets, HTTP for web browsing has its own handshake packets, <text class="what-is-tls-handshake-hl">and TLS, in order to achieve data security and integrity, needs to exchange encryption and authentication data (keys and certificates, etc.) in a secure way at the beginning of the connection, so it also has its own handshake packets.</text>

It is these TLS handshake packets that cause the "TLS in Any" vulnerability. Remember the definition of "handshake packets" above? They are "some data packets that meet specific specifications". This "specification" defines the structure, sequence, and direction of the handshake packets - when the specification specifies the structure and the size of each data in this structure is predictable, the size of these handshake packets has actually become predictable. Coupled with the one-to-one correspondence between the sequence and direction of the TLS specification and the reviewer's estimate of the handshake packet size, the traffic classification system can roughly distinguish TLS traffic.

For example, here is a lovely Cat protocol. Its handshake packets are sent at the beginning of the connection. Its specification stipulates the structure, sequence, and direction of sending and receiving as follows:
- Structure & Sequence:
- First packet: 200 bits of cat weight
- Second packet: 700 bits of breed number
- Third packet: 1400 bits of cat love
- Fourth packet: 1400 bits of cat food remaining
- Send and receive direction
- First packet: A -> B
- Second packet: A -> B
- Third packet: A <- B
- Fourth packet: A <- B

At the same time, we encrypt each packet of the Cat protocol before transmission, **making them 10-200 bits larger after encryption**. *(Encryption defined by modern cryptography can only make the size of the data unchanged or increase after encryption)*

So when the traffic classification system tries to detect **encrypted Cat protocol**, it only needs to passively observe at the beginning of each connection and judge it like this:
- First packet: size between 210 bits and 400 bits, direction A -> B
- Second packet: size between 710 bits and 900 bits, direction A -> B
- Third packet: size between 1410 bits and 1600 bits, direction A <- B"
- Fourth packet: size between 1410 bits and 1600 bits, direction A <- B

If the beginning of a connection is observed to match this traffic pattern, it is likely to be the Cat protocol. Encryption defined by modern cryptography can only make the size of each handshake packet in the traffic fluctuate within a predictable range, and encryption cannot change the order and direction of sending and receiving. Therefore, this traffic pattern cannot be completely changed by encryption, and the "TLS in Any" vulnerability cannot be solved.

What if it is a misjudgment? Misjudgment is indeed possible, but in reality, when a user visits an HTTPS website, there are often several TLS connections opened. At the beginning of these connections, the TLS handshake packets are proxied by circumvention tools, so these connections are likely to be identified by the traffic classification system.
As long as the probability of misjudgment (false positive rate) is much smaller than the probability of correct identification, the censor only needs to observe whether a certain user accesses a foreign server. Whether there are more connections identified as circumvention traffic by the traffic classification system, and then judge whether the user is using circumvention tools.
Since the probability of misjudgment is much smaller than the probability of correct identification, ordinary users who do not use circumvention tools must have fewer misjudged connections, and naturally it is difficult to reach the level of "being judged by the censor as using circumvention tools".

### 🤔Why does the TLS in Any issue need to be taken seriously?

1. There have been precedents of censors in mainland China using **entropy-based rules** to roughly detect and block fully encrypted proxies. However, this censorship strategy still has a high false positive rate of 0.6% in the [GFW.REPORT experiment (Section 7.2)](https://gfw.report/publications/usenixsecurity23/zh/#sec:blocking-analysis). Because censors face the [base rate fallacy problem](https://zh.wikipedia.org/wiki/基本率謬誤), the 0.6% false positive rate means that when this censorship strategy is widely used by GFW for all traffic, it will also cause a lot of normal traffic to be accidentally damaged.

Therefore, censors need to use **additional censorship strategies** to control the number of accidental damages when expanding the scope of censorship. The traffic classification-based censorship strategy introduced by the "TLS in Any" vulnerability is an **excellent additional censorship strategy**. The joint use of these two censorship strategies will effectively improve the censors' ability to detect and block circumvention traffic.

2. In the [paper](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) mentioned at the beginning of this article, the author proposed two **traffic pre-classifiers** for existing evasion tools in Section 8 of the paper. The classification criteria are relatively rough, but they can also be used as the **"additional censorship strategies"** mentioned in 1., and further improve the censor's identification ability when used together with other censorship strategies.

- Pre-classifier 1 is based on "the **round-trip count** within the first 15 packets of the TCP connection **after the outer TLS handshake is completed"

How to understand? In a normal TCP connection, the server will always respond with an ACK packet *(that is, the TCP packet with the value of the ACK flag in the TCP header which is set to the value of the SEQ sequence number of the next packet that the server should receive)* every time it receives a data packet from the client, so the censor can know the total **number of round trips** of data transmitted between the user and the server by recording the ACK packets passing through the censor in the user's TCP connection. I call it **"round-trip count"**. In a typical HTTPS access process to a website, after the TLS handshake is completed, the TCP connection initiated by the user usually only has one GET request *(one uplink)*, and a series of response packets *(one downlink)* from the web server, with a total of only **1 round trip**.

If the circumvention tool proxies the same HTTPS request, after the TLS handshake of the circumvention tool is completed, **1 (nested) TLS handshake will be proxied first**, and then the 1 round-trip HTTP request process mentioned above will be performed. And this proxied (nested) TLS handshake** will at least add 1 round-trip** to the connection initiated by the circumvention tool. Therefore, when using this preprocessor, filtering out connections with large round-trip counts will avoid processing and accidental damage to most normal traffic.

- Preclassifier 2 is based on "the **total size** of the first packet sequence (burst) of the TCP connection **after the outer TLS handshake is completed"

How to understand? In a normal TCP connection, given the different carrying capacity of each route in the network path, a large packet needs to be divided into several parts (i.e., fragments),Then, at a certain time interval, **parts are sent one by one**. The process of sending parts one by one forms a series of packets, which originally belong to the same packet. A series of packets is called a packet sequence (burst). Because the evasion tool needs to proxy 1 (nested) TLS handshake** when proxying HTTPS requests, plus the size expansion caused by encryption, the **total size** of the first packet sequence will be larger than the first packet sequence of normal HTTPS traffic.

Although the classification criteria of these two traffic pre-classifiers are rough, their performance in the [paper] (https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) mentioned at the beginning is not bad. According to the experimental data in Section 8 of the paper, when the screening criteria are set to less than 2.5 round-trip counts for pre-classifier 1 and less than 300 bytes for pre-classifier 2, the two pre-classifiers work in series and can filter out 82.5% of normal traffic and 1.5% of proxy traffic.

### 💡Inspiration from the censorship strategy based on traffic classification
After discussing the traffic classification identification principle of the TLS in Any problem, I also made two summaries, hoping to help readers understand the essence of the problem more deeply.

1. **Packet-level** obfuscation strategies (filling, encryption, reordering, etc. of data in a single packet) are not enough to counter **connection-level** censorship strategies, which can be explained in popular terms as "dimensionality reduction strikes".

2. Connection-level features (size distribution within the distance of the first n packets of each connection, round-trip counts, and even packet sending and receiving delay distribution, etc.) should also be processed by filling packets, splitting packets, delaying packets, etc.

### 🧰Conceived avoidance strategies for the TLS in Any problem
At the same time, I also envisioned the following feasible solutions (avoidance strategies), hoping to inspire readers to find more feasible avoidance strategies. The essence of the following avoidance strategies is to maximize the misjudgment rate of the traffic classification system.

1. Deconstruct the upstream and downstream connections *(the disadvantage is poor reliability)*

2. Send the proxied TLS handshake packets in fragments, and make a false response to each received fragment before the receiver receives the last fragment of a handshake packet *(such as constructing a packet with checksum errors for response)*, to prevent the censor from merging fragments (reassembling traffic) or creating more obvious features.

(This strategy has been implemented in the circumvention tool Restls Protocol [(Github repository link)](https://github.com/3andne/restls), but this strategy is likely to have a significant impact on user experience)

3. Switch to QUIC-based circumvention tools, using the unreliability of udp to increase the complexity of traffic classification, thereby causing censors to at least slow down the development and deployment of their censorship technology.

(Unfortunately, during the [Third Plenary Session of the 20th Central Committee of the Communist Party of China](https://zh.wikipedia.org/wiki/The Third Plenary Session of the 20th Central Committee of the Communist Party of China) held on July 15-18, 2024, there were spontaneous reports of users in mainland China blocking UDP-based circumvention tools on a large scale ([link](https://linux.do/t/topic/136940/3) from the LinuxDo forum))

### 🧱Several challenges for censors to deploy traffic classification-based censorship strategies at scale
1. Collateral damage is still quite high. Especially now that TLS1.3 is being deployed on a larger scale, while TLS1.2 deployment is decreasing, according to the experimental data of the traffic classification system deployed on the network egress of the US operator [Merit Network](https://www.merit.edu/) in the [paper](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) mentioned at the beginning of this article, when the TLS1.3 classifier runs in a mode with a true positive rate of about 26% in the experiment, its misjudgment rate (false positive rate) increases by 40 times (0.025%→1%) compared to the TLS1.2 classifier with a slightly lower true positive rate (about 24%).
2. For evasion tools that use **aggressive random padding strategies** (such as XTLS-Vision, obfs4), the reviewer needs to use additional custom classifiers to process the traffic; and since the packet size is no longer suitable for classification, the misjudgment rate (false positive rate) should increase.
3. For evasion tools that are based on TLS and use aggressive random padding strategies, since only the handshake packet in normal TLS traffic has low entropy, it is theoretically impossible to use entropy-based rules to pre-classify the proxy traffic of these evasion tools. This situation should further increase the misjudgment rate (false positive rate).

*(Recommended related reading: )*

1.[XTLS Vision, fixes TLS in TLS, to the star and beyond · XTLS/Xray-core · Discussion #1295 (github.com)](https://github.com/XTLS/Xray-core/discussions/1295) ("Five Packets of Life and Death" original source)
