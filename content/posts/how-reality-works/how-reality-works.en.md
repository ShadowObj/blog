+++
title = 'How does XTLS REALITY break through the whitelist? REALITY source code analysis'
description = 'Beyond the security of normal TLS for anti-censorship? No need to buy domain names and configure TLS? How does the "Magic Tech" REALITY achieve these?'
date = "2024-08-08 15:00:00+08:00"
draft = false
tags = ["Anti-censorship","SNI whitelist","TLS","Encrypted proxy"]
categories = ["Anti-censorship","TLS"]
#wordCount = true
#fuzzyWordCount = true
#viewsCount = true
#readingTime = true
wordNumber = 7600
readingNumber = 15
compact4Phone = true
betterList4Phone = true
+++

(All the content below is translated from Chinese by Google Translate ↓)<br>
(Please feel free to make your own comments at the translation.)

### ℹ️Foreword
[XTLS/Xray-core](https://github.com/XTLS/Xray-core/), also known as Project X is an open source censorship circumvention tool. It is well-known in the Chinese anti-censorship field for its novel, avant-garde and practical conceptual technologies ~~ and the project creator & maintainer RPRX who once mysteriously disappeared~~. These technologies include VLESS, XTLS-Vision, XUDP... There is always one you have heard of or used.

Since some areas in mainland China began to deploy a new censorship strategy on a large scale -- **SNI whitelist**, all TLS-based circumvention tools before the appearance of REALITY and ShadowTLS, whether directly connected or connected through transit or CDN, became unavailable in these areas overnight.

*(It is known that China Mobile in Quanzhou, Fujian Province, mainland China is the first ISP in mainland China to deploy this censorship strategy)*

The circumvention tool ShadowTLS developed by ihciah previously received widespread attention. However, ShadowTLS was still in version v1 at that time, with an incomplete code base and weak censorship resistance. Later, REALITY developed by RPRX also had the ability to **circumvent the SNI whitelist censorship strategy**, and its high integration with the mature circumvention tool [Xray-core](https://github.com/XTLS/Xray-core/), ~~ perhaps there was also the surprise brought to users by the return of RPRX~~, which attracted a lot of attention in the field of Chinese anti-censorship.

So how does REALITY circumvent this censorship strategy? How to understand its details from a technical perspective? These two questions will be the focus of this article. By interpreting REALITY's source code, readers can sort out the specific implementation of REALITY.

(PS: ShadowTLS has three incompatible versions: v1, v2, and v3. v2 fixes the active detection vulnerability in v1, see the paper [Chasing Shadows: A security analysis of the ShadowTLS proxy](https://www.petsymposium.org/foci/2023/foci-2023-0002.pdf); and v3 is designed to make the minimum necessary modifications to one of the popular TLS library implementations, `Rustls`, so that the server has the ability to respond normally to TLS Alert (to deal with MITM traffic tampering), which is more hidden than v2; of course, this is all later, and there may be an article about ShadowTLS in the future, so I won’t go into details about it here)

### 👀 What is "SNI whitelist"? What is the relationship between SNI and TLS?
You may know that the widely used application layer security protocol, the cornerstone of HTTPS, **the TLS protocol**, has its own "handshake process" when initiating a connection. What? You don't know what a "handshake" is? You can take a look at [this paragraph](/posts/what-is-tls-in-any/?highlight=what-is-tls-handshake-hl) in my previous article "[Traffic classification and identification of encryption proxy? A preliminary exploration of TLS in Any](/posts/what-is-tls-in-any/)".

TLS has been a "**hybrid encryption system**" since its first version was designed. This means that TLS uses both asymmetric and symmetric encryption algorithms. Symmetric encryption algorithms require both parties to hold **exactly the same** key, and the encryption and decryption overhead is low; while asymmetric encryption only requires both parties to exchange **public keys in their respective key pairs**, but asymmetric encryption requires verification that the public key has not been replaced or tampered with when exchanging public keys, which gave rise to the digital certificate mechanism. And asymmetric encryption and decryption overhead is large. Therefore, TLS uses asymmetric encryption to transmit keys used for symmetric encryption, and in order to exchange public keys used for asymmetric encryption, the TLS handshake mechanism was born.

Before understanding the **SNI whitelist** censorship strategy, let's take a look at the handshake process of a common TLS1.3 connection without ECH:

(Here is a picture from [Cloudflare Blog](https://blog.cloudflare.com/encrypted-client-hello/), copyright belongs to [Cloudflare lnc.](https://www.cloudflare.com/).)

![](img/how-tls-13-handshakes-cloudflare.png)

First, the client initiates a TLS connection. After correctly completing the [TCP handshake](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_establishment), the client generates a key pair and sends a TLS Client Hello message to the server through the open TCP connection: All handshake parameters of the client, including various extension fields *(extensions)* and key_share *(the public key in the key pair just generated by the client)*. These parameters **whether sensitive or not** are sent in the TLS Client Hello.

Secondly, the server uses the key exchange algorithm allowed in TLS Client Hello to generate a key pair and sends TLS Server Hello: The Server Hello message of TLS1.3 is different from TLS1.2. It only contains all **insensitive** handshake parameters of the server, such as key_share *(the public key in the key pair just generated by the server)*.

After receiving the TLS Server Hello, the client extracts the key_share *(the public key in the key pair just generated by the server)* and inputs it into the Diffle-Hellman key exchange function together with the private key in the key pair originally generated by the **client**.

*(The Diffle-Hellman key exchange algorithm is referred to as the DH algorithm. The DHE algorithm is a DH variant that achieves forward security by rotating keys. The ECDHE algorithm is a DHE variant based on elliptic curves. As of the time of this article, the latest version of [crypto/tls](https://pkg.go.dev/crypto/tls) only supports the ECDHE key exchange algorithm when processing TLS1.3 public key exchange.)*

DH and its derivative algorithms have a common property: exchanging the public or private keys of two key pairs that meet the requirements of the algorithm, and then inputting the two exchanged key pairs into the algorithm, you will definitely get **exactly the same** value. That is: generate key pair A (including public key pub_A and private key sec_A) and key pair B (including public key pub_B and private key sec_B) that meet the requirements of the algorithm, and input (pub_A, sec_B) into the algorithm. The value obtained must be **exactly the same** as the value obtained by inputting (pub_B, sec_A) into the algorithm.

Here, the client uses the public key from the server and its own private key to generate a key by inputting the DH algorithm. The generated key must be the same as the key calculated by the server using the public key from the client and its own private key. The key generated here is called `preMasterKey`, which is only used to encrypt and decrypt the next **handshake** message.

Next, the server uses `preMasterKey` to encrypt **sensitive** handshake parameters that have not yet been sent, including the digital certificate used to verify the server's identity *(because the digital certificate contains the corresponding domain name/IP information)*, encapsulates it into a TLS Application Data message *(also called Encrypted Extensions, but this name is only visible after decryption)*, and attaches it to the Change Cipher Spec before sending it to the client. After receiving the Change Cipher Spec, the client uses `preMasterKey` to decrypt the TLS Application Data attached to it, verifies the server's identity *(that is, proves that the server holds a specific domain name/IP)* through the digital certificate in it, extracts the handshake parameters, constructs a TLS Finished message, and encrypts it with `preMasterKey` and sends it to the server to indicate that the TLS handshake is successfully completed. At the same time, the client inputs the complete handshake parameters extracted from the additional messages after TLS Server Hello and Change Cipher Spec into the DH algorithm to calculate the `MasterKey`, which is used to encrypt and decrypt **all** messages *(i.e. the following TLS Application Data packets)*. The server also calculates the `MasterKey` with the same logic after receiving the TLS Finished message.

(In the actual TLS library implementation, the client often sends the first TLS Application Data containing application data before the server uses the TCP ACK packet to respond to TLS Finished to reduce latency. The last "GET /index.html HTTP/1.1" in the diagram above refers to this situation.)

Among them, at the beginning of the TLS handshake, the client uses the [SNI extension (**S**erver **N**ame **I**ndicator)](https://datatracker.ietf.org/doc/html/rfc6066#section-3) in the TLS Client Hello message to indicate to the server the website it wants to visit. This is critical for the modern internet, as it is now common for many origin servers to sit behind a single TLS server, such as a content delivery network (CDN). The server uses SNI to determine who will authenticate the connection: without it, there is no way to know which website's TLS certificate to present to the client.

The key to censors implementing SNI-based censorship strategies is that SNI is **plaintext** visible to any route in the network (the endpoints that traffic passes through when it is transmitted), and therefore will reveal the origin server that the client wants to connect to. At the same time, censors block TLS traffic that is not trusted by the censor by controlling all traffic egress routes and **limiting the values ​​of the SNI extension in the TLS Client Hello that are allowed to pass**. We call this censorship strategy "**SNI whitelisting**".

Questions: Why is TLS1.3 chosen as an example instead of TLS1.2? Why is the ECH feature of TLS1.3 not enabled here?

Answers:
1. TLS1.3 is largely a simplified version of TLS1.2. It fixes many security vulnerabilities in the design of the previous generation of protocols, is designed to be more concise and easy to use, and has been deployed on an ever-increasing scale since the first official version was released in 2018. Secondly, the REALITY server implemented by [XTLS](https://github.com/XTLS) does not support REALITY clients to use TLS versions other than TLS1.3 to connect to transmit evasion traffic.

2. As of the time of this article, the REALITY implemented by [XTLS](https://github.com/XTLS) does not enable the ECH feature of TLS1.3 by default. ~~Well, there is actually no relevant option in the configuration file~~. Moreover, the core of REALITY's design is to "perform" a valid TLS handshake using **allowed SNI extended values** to the censor (middleman), and transmit evasion traffic through the TLS channel opened by the handshake.

### 🤔 Let's think about how to change SNI

1. When the client of the circumvention tool initiates a TLS handshake to the server, directly modify the value of the SNI extension of TLS Client Hello.

This method is simple and crude, but it is obvious that it does not have good censorship resistance and will destroy the TLS authentication mechanism. The digital certificate used to verify the identity of the server during the TLS handshake needs to be signed by the upper CA *(certificate authority)* trusted by the client using a private key, including **certificate attachment information and domain name information**, so it is impossible to modify a valid certificate from another website while maintaining its validity without the upper CA signing the modified certificate. In fact, in this case, **even the owner of the certificate** cannot modify the valid digital certificate he holds while maintaining its validity.

The value of the SNI extension of TLS Client Hello **must** be the same as the **domain name** in the extension information of the valid digital certificate in the TLS Server Hello from the server.

The domain name in the extension information of the valid digital certificate in the TLS Server Hello of the self-server is consistent. *(Not necessarily exactly the same. There is a type of "wildcard certificate" in the digital certificate used for TLS server authentication. This type of certificate can verify the identity of all subdomains under a domain name without issuing certificates for each subdomain.)*

Similarly, the reviewer can record the value of the SNI extension of the TLS Client Hello in the TLS traffic passing through, use this value to construct the TLS Client Hello, and send it to the corresponding server to check the validity of the digital certificate in the returned TLS Server Hello, and whether the domain name in the certificate extension information is consistent with the original SNI value. If any of them does not match, the original traffic can be considered as circumvention traffic.

2. From 1., we know that if you want to modify the SNI of TLS Client Hello, you may need to modify the digital certificate.

Of course, this is just a joke. The mathematical properties of digital signatures determine that it cannot be tampered with while maintaining its validity under current computing power conditions.

Wait, did we mention something in the previous section? Let's look at the diagram again... The server's digital certificate in the TLS1.3 handshake is sent encrypted, right? Therefore, in 1., the censor cannot passively observe and collect the digital certificate in the TLS1.3 handshake initiated by the user. The censor must construct the TLS Client Hello using the original SNI value to obtain the previous digital certificate to achieve the purpose of censorship. Although digital certificates cannot be tampered with, if we can distinguish between circumventing clients and censors, can we provide them with different digital certificates?

###  🔍 Try to dive into the code ocean of REALITY?
In the previous section, we proposed the circumvention strategy of "providing different digital certificates by distinguishing TLS client types", which is one of the key design of REALITY. But how to distinguish? How to negotiate the key `preMasterKey` used for encrypted handshake? In this section, we try to go deep into the source code of REALITY, combine the knowledge of the first section, and analyze the technical details of REALITY's implementation of this circumvention strategy.

**Please don't leave yet**! Whether you are a programming novice or a developer, this section will try to explain the functions of all the source codes in this section in **easy-to-understand natural language**. Please always remember: **Understanding the program is to understand the design ideas, not to understand the programming language knowledge**.

All server source codes appearing here are based on the `079d0bd` commit version of the `main` branch in the Github code library [XTLS/REALITY](https://github.com/XTLS/REALITY);
All client source codes appearing here are based on the `4c9e4b9` commit version of the `main` branch in the Github code library [XTLS/Xray-core](https://github.com/XTLS/Xray-core/).

#### 💻Client

Since the design of Xray-core is that the client initiates the proxy connection, let's start with the client's `reality` package <sup>1</sup>:
*(<sup>1</sup> package, package, is a unit for organizing program functions. In Go, only one package can exist in the same directory (excluding subdirectories))*

In Xray-core, all packages responsible for encapsulating and transmitting proxy traffic are placed in the `transport/internet` directory, and the `reality` package is no exception:

``````plaintext
xray-core/
|-- transport/
| |-- internet/
| | |-- reality/
| | | |-- config.go
| | | |-- config.pb.go
| | | |-- config.proto
| | | |-- reality.go
``````

The three files config.proto, config.pb.go, and config.go in this directory start from The main functions are to define the protobuf3 field format passed into the package, define the public methods of struct<sup>2</sup> `reality.Config`<sup>3,4</sup> for storing configurations, and fill the public fields<sup>5</sup> of `reality.Config` completely. `reality.Config` mainly stores configurations for REALITY.
*(<sup>2</sup> struct, a unit for organizing data in Go, an object in a broad sense; <sup>3</sup> method, refers to a function bound to a specific struct for reading, writing/processing all fields of the struct; <sup>4</sup> public method, refers to a method that can be called by other packages; <sup>5</sup> public field, refers to a field that can be accessed and modified by other packages)*

The key to initiating a REALITY connection is in `reality.go`, where func<sup>6</sup> `UClient` is called when other packages initiate a REALITY connection, and is the most important functional entry point for the client part of the package:

```Go
// Xray-core/transport/internet/reality/reality.go#L106
func UClient(c net.Conn, config *Config, ctx context.Context, dest net.Destination) (net.Conn, error)
```
*(<sup>6</sup> func, function, a unit that implements a specific subdivision function)*

As shown above, func UClient accepts the readable and writable network stream interface c from the net package, config for storing REALITY configuration, notification channel ctx for timeout control, and structure dest indicating the destination.

One of the key functions of func UClient is to initialize the struct `UConn` defined in this package:

```Go
// Xray-core/transport/internet/reality/reality.go#L64-L69
// Struct fields definition of UConn
type UConn struct {
	*utls.UConn
	ServerName string
	AuthKey    []byte
	Verified   bool
}

// Xray-core/transport/internet/reality/reality.go#L108-L115
// uConn is assigned to the UConn instance, utlsConfig is assigned to the utls.Config instance (configuration for utls package)
uConn := &UConn{}
utlsConfig := &utls.Config{
	VerifyPeerCertificate:  uConn.VerifyPeerCertificate,
	ServerName:             config.ServerName,
	InsecureSkipVerify:     true,
	SessionTicketsDisabled: true,
	KeyLogWriter:           KeyLogWriterFromConfig(config),
}

// Xray-core/transport/internet/reality/reality.go#L124
// Initialize utls.UClient and assign it to the first field of uConn
uConn.UConn = utls.UClient(c, utlsConfig, *fingerprint)
```

The first field of UConn is an anonymous field <sup>7</sup>, of type pointer to the UConn instance from the [utls](https://github.com/refraction-networking/utls)<sup>8</sup> package. This code configures and initializes the uConn used to initiate and process the TLS handshake based on parameters such as Servername(SNI), TLS Client Hello fingerprint identification countermeasure, and func `VerifyPeerCertificate` for verifying the validity of the server certificate and the server identity.

*(<sup>7</sup>Anonymous fields, i.e. fields with the same name as the corresponding type by default; <sup>8</sup> utls, a variant of the go standard library "crypto/tls", provides TLS Client Hello fingerprinting, full access to TLS handshakes, Fake Session Tickets, etc. for anti-censorship purposes)*

**Then we come to the key point**: REALITY clients use the **Session ID field space** in TLS Client Hello to covertly mark clients so that servers can distinguish censors from legitimate REALITY clients. The Session ID field was originally used for the 0-RTT session resumption feature of TLS1.3, but it is rarely enabled because it makes the first packet lose its anti-replay feature. When the 0-RTT session resumption feature is not enabled, the Session ID used for each TLS1.3 connection should be **randomly generated**.

*(Xray-core also defines a block-level scope for the following client code.)*

```Go
// Xray-core/transport/internet/reality/reality.go#L126-L135
// Generate the default ClientHello and provide it to uConn
// In this step, the client's TLS key pair is also generated
uConn.BuildHandshakeState()
// Assign the pointer of the generated default ClientHello to hello
// (Assigning a pointer to hello means that modifying hello means modifying the original data)
hello := uConn.HandshakeState.Hello
// Assign a 32-byte empty slice (dynamic array) to SessionId
// And fill it to the 40th-71th bytes of ClientHello, occupying the unit position
hello.SessionId = make([]byte, 32)
copy(hello.Raw[39:], hello.SessionId)
// Fill the version number x.y.z of Xray-core into the 1st-3rd bytes of SessionId
hello.SessionId[0] = core.Version_x
hello.SessionId[1] = core.Version_y
hello.SessionId[2] = core.Version_z
hello.SessionId[3] = 0 // Fill 0 to the 4th byte
// Fill the current Unix timestamp into the 5th-8th bytes of SessionId
binary.BigEndian.PutUint32(hello.SessionId[4:], uint32(time.Now().Unix()))
// Fill shortId from the 9th byte of SessionId
copy(hello.SessionId[8:], config.ShortId)

// Xray-core/transport/internet/reality/reality.go#L139
// Convert the REALITY public key to a usable public key object
publicKey, err := ecdh.X25519().NewPublicKey(config.PublicKey)

// Xray-core/transport/internet/reality/reality.go#L143
// Use the x25519 private key and REALITY public key in the client TLS key pair generated by BuildHandshakeState() to enter the ECDH algorithm to calculate the shared key.
// Input the key into HKDF (key derivation function based on HMAC) to calculate preMasterKey.
uConn.AuthKey, _ = uConn.HandshakeState.State13.EcdheKey.ECDH(publicKey)
// Xray-core/transport/internet/reality/reality.go#L147-L149
if _, err := hkdf.New(sha256.New, uConn.AuthKey, hello.Random[:20], []byte("REALITY")).Read(uConn.AuthKey); err != nil {
			return nil, err
}

// Xray-core/transport/internet/reality/reality.go#L150-L156
// Select AEAD algorithm: AES-GCM or Chacha20-Poly1305.
// AEAD algorithm ensures the security, integrity and anti-replay of ciphertext data,
// and also provides integrity guarantee for additional data.
var aead cipher.AEAD
if aesgcmPreferred(hello.CipherSuites) {
	block, _ := aes.NewCipher(uConn.AuthKey)
			aead, _ = cipher.NewGCM(block)
} else {
	aead, _ = chacha20poly1305.New(uConn.AuthKey)
}

// Xray-core/transport/internet/reality/reality.go#L160-L161
// Encrypt SessionId using AEAD algorithm.
// Here preMasterKey is used as key and ClientHello is used as additional data.
// Note: hello.SessionId[:0] refers to reuse of its memory space.
aead.Seal(hello.SessionId[:0], hello.Random[20:], hello.SessionId[:16], hello.Raw)
// Copy the final SessionId to bytes 40-72 of ClientHello
// copy() is used to copy data. Usage: copy(destination, source)
copy(hello.Raw[39:], hello.SessionId)
```

At this point, the REALITY client has completed its own hidden marking. Next, the client initiates a TLS connection to the REALITY server:

```Go
if err := uConn.HandshakeContext(ctx); err != nil {
	return nil, err
}
```

#### 🐧 Server

~~👆I use this emoji not because I prefer Linux servers, but because the performance and maintenance experience of Windows Server is too poor~~

Coming to the [source code](https://github.com/XTLS/REALITY/) of the REALITY server, it is actually a variant of the server part of the [crypto/tls](https://pkg.go.dev/crypto/tls) package in the Go 1.20 standard library. Since the REALITY server modifies the [crypto/tls](https://pkg.go.dev/crypto/tls) package with the principle of minimal modification, there are many files in the directory that are not directly related to the REALITY protocol, and the directory tree is not listed here.

The key to the REALITY server processing TLS handshake is func Server in the file `tls.go`. In fact, after carefully reading the client source code in Xray-core, readers should have a general understanding of the key logic of the server to distinguish legitimate REALITY clients. In view of this, the following source code comments will be relatively concise, and readers are welcome to forgive me.

So how does the REALITY server inform the legitimate REALITY client that it can transmit? How does the server handle the handshake initiated by the illegal client (censor)?
For the convenience of description, here is a conclusion:

1. The REALITY server forwards the ClientHello to the TLS server dest (mask server) with a valid certificate, makes minimal modifications to the ServerHello and Change Cipher Spec from dest and its attached encrypted information, and then forwards it to the REALITY client. This approach can complete the TLS handshake in the normal TLS server way, avoiding the generation of server-side TLS fingerprints.

2. When the REALITY server modifies the encrypted information attached to the Change Cipher Spec, it uses `preMasterKey` to sign the digital certificate in it, and replaces the original information with the signature information, so that the REALITY client can use the signature calculated by `preMasterKey` to compare, thereby informing the client that it can transmit.

3. The REALITY server forwards all traffic except that from the legitimate REALITY client to dest. The benefits of this approach are the same as 1.

```Go
// REALITY/blob/main/tls.go#L113
// Here is the function definition, where conn is the TCP connection accepted by the server
func Server(ctx context.Context, conn net.Conn, config *Config) (*Conn, error)

// REALITY/blob/main/tls.go#L119
// Open a TCP connection to dest (mask server) in REALITY configuration
target, err := config.DialContext(ctx, config.Type, config.Dest)

// REALITY/blob/main/tls.go#L139-L156
// Initialize the mutex (allows to monopolize a task)
mutex := new(sync.Mutex)

// Initialize the serverHandshakeStateTLS13 instance
// which is defined in handshake_server_tls13.go to store the handshake information
hs := serverHandshakeStateTLS13{
		c: &Conn{
			conn: &MirrorConn{
				Mutex:  mutex,
				Conn:   conn,
				Target: target,
			},
			config: config,
		},
		ctx: context.Background(),
	}

// Indicates whether the client sends irrelevant data before completing the handshake
copying := false

// Waiting group, so that the main coroutine can wait for the sub-coroutine to finish running
// Coroutine: lightweight thread in Go language
waitGroup := new(sync.WaitGroup)
waitGroup.Add(2) // Add two sub-coroutines

// REALITY/blob/main/tls.go#L158-L223
// Run the coroutine to distinguish clients
go func() {
	for {
		mutex.Lock() // Lock, monopolize current task
		// Read ClientHello, context.Background() generates an empty ctx placeholder
		hs.clientHello, err = hs.c.readClientHello(context.Background())
		// Determine 1. Whether the client sends data before completing the handshake; 2. Read error;
		// 3. The version is less than TLS1.3; 4. The SNI in ClientHello is not in the configuration
		// If any condition is met, end the loop (break no longer enters the next loop)
		// (Go uses unconditional for to represent an infinite loop)
		if copying || err != nil || hs.c.vers != VersionTLS13 || !config.ServerNames[hs.clientHello.serverName] {
			break
		}
		// for loops to obtain the client's x25519 public key
		// TLS1.3 ClientHello contains as many public keys as possible
		// To avoid the server not supporting a specific AEAD algorithm and increasing latency
		for i, keyShare := range hs.clientHello.keyShares {
			// Determine whether the key type is x25519 and the length is equal to 32 bytes
			// This is the length and type of the public key used by the REALITY client
			// If any condition is not met, countinue enters the next loop
			if keyShare.group != X25519 || len(keyShare.data) != 32 {
				continue
			}
			// Enter the REALITY private key and the client public key into the ECDH algorithm to calculate the shared key.
			if hs.c.AuthKey, err = curve25519.X25519(config.PrivateKey, keyShare.data); err != nil {
				break
			}
			// The key is input into HKDF (HMAC-based key derivation function) to calculate preMasterKey.
			if _, err = hkdf.New(sha256.New, hs.c.AuthKey, hs.clientHello.random[:20], []byte("REALITY")).Read(hs.c.AuthKey); err != nil {
				break
			}
			// Choose AEAD Algorithm。
			var aead cipher.AEAD
			if aesgcmPreferred(hs.clientHello.cipherSuites) {
				block, _ := aes.NewCipher(hs.c.AuthKey)
				aead, _ = cipher.NewGCM(block)
			} else {
				aead, _ = chacha20poly1305.New(hs.c.AuthKey)
			}
			if config.Show {
				fmt.Printf("REALITY remoteAddr: %v\ths.c.AuthKey[:16]: %v\tAEAD: %T\n", remoteAddr, hs.c.AuthKey[:16], aead) //for debug
			}
			// Initialize two 32-byte slices
			// Used to store ciphertext and plaintext respectively.
			ciphertext := make([]byte, 32)
			plainText := make([]byte, 32)
			copy(ciphertext, hs.clientHello.sessionId)
			copy(hs.clientHello.sessionId, plainText)
			// Decrypt SessionId using AEAD algorithm.
			if _, err = aead.Open(plainText[:0], hs.clientHello.random[20:], ciphertext, hs.clientHello.raw); err != nil {
				break
			}
			// Parse the Xray-core version contained in SessionId,
			// Unix timestamp, and ShortId
			copy(hs.clientHello.sessionId, ciphertext)
			copy(hs.c.ClientVer[:], plainText)
			hs.c.ClientTime = time.Unix(int64(binary.BigEndian.Uint32(plainText[4:])), 0)
			copy(hs.c.ClientShortId[:], plainText[8:])
			if config.Show {
				fmt.Printf("REALITY remoteAddr: %v\ths.c.ClientVer: %v\n", remoteAddr, hs.c.ClientVer)
				fmt.Printf("REALITY remoteAddr: %v\ths.c.ClientTime: %v\n", remoteAddr, hs.c.ClientTime)
				fmt.Printf("REALITY remoteAddr: %v\ths.c.ClientShortId: %v\n", remoteAddr, hs.c.ClientShortId) //for debug
			}
			// Determine whether Xray-core version, time delay, ShortId is allowed
			if (config.MinClientVer == nil || Value(hs.c.ClientVer[:]...) >= Value(config.MinClientVer...)) &&
				(config.MaxClientVer == nil || Value(hs.c.ClientVer[:]...) <= Value(config.MaxClientVer...)) &&
				(config.MaxTimeDiff == 0 || time.Since(hs.c.ClientTime).Abs() <= config.MaxTimeDiff) &&
				(config.ShortIds[hs.c.ClientShortId]) {
				hs.c.conn = conn
			}
			// Identifies the type of public key used by the client for subsequent use
			hs.clientHello.keyShares[0].group = CurveID(i)
			break
		}
		if config.Show {
			fmt.Printf("REALITY remoteAddr: %v\ths.c.conn == conn: %v\n", remoteAddr, hs.c.conn == conn) //for debug
		}
		break
	}
	// Unlock, cancel monopolization of current task
	mutex.Unlock()
	// Determine whether the client sends irrelevant data without completing the handshake
	if hs.c.conn != conn {
		if config.Show && hs.clientHello != nil {
			fmt.Printf("REALITY remoteAddr: %v\tforwarded SNI: %v\n", remoteAddr, hs.clientHello.serverName) //for debug
		}
		// Forward the connection to dest in the configuration (i.e. the masquerade server)
		io.Copy(target, underlying)
	}
	// Notify the waiting group that the coroutine has completed running
	waitGroup.Done()
}()
```

At this time, the server has completed the task of distinguishing clients. But the TLS handshake is not yet completed?

In the following part, the REALITY server forwards the ClientHello to dest, modifies the returned ServerHello, and sends it back to the legitimate REALITY client to complete the TLS handshake, while informing the legitimate REALITY client that it can transmit evasion traffic.

```Go
// REALITY/blob/main/tls.go#L225-L349
// Run the coroutine for REALITY server handshake and communication with dest
go func() {
	// Initialize two slices of size = 8192 long
	// s2cSaved is used to store all received data from dest
	// buf is the buffer from REALITY server to dest
	s2cSaved := make([]byte, 0, size)
	buf := make([]byte, size)
	handshakeLen := 0
f:
	for {
		// Temporarily give up CPU time slices to optimize program performance
		runtime.Gosched()
		// Read the received data from dest into buf (buf will be cleared)
		n, err := target.Read(buf)
		// Determine whether data from dest has been received
		if n == 0 {
			if err != nil {
				conn.Close()
				waitGroup.Done()
				return
			}
			continue
		}
		// Lock, monopolize current task
		mutex.Lock()
		// Append the data in buf to the existing s2cSaved data
		s2cSaved = append(s2cSaved, buf[:n]...)
		// Determine whether the client sends irrelevant data without completing the handshake
		if hs.c.conn != conn {
			// Indicates that the client sends irrelevant data without completing the handshake
			copying = true
			break
		}
		// Determine whether the length of s2cSaved is too large
		if len(s2cSaved) > size {
			break
		}
		// Traverse type to determine the type of the packet returned by dest
		// REALITY/blob/main/tls.go#L91-L99
		// types = [7]string{
		// "Server Hello",
		// "Change Cipher Spec",
		// "Encrypted Extensions",
		// "Certificate",
		// "Certificate Verify",
		// "Finished",
		// "New Session Ticket",
		// }
		for i, t := range types {
			// Determine whether ServerHello has been sent
			// Enter the next loop if it matches
			if hs.c.out.handshakeLen[i] != 0 {
				continue
			}
			// Determine whether the type of this loop is
			// "New Session Ticket" and the length of s2cSaved is 0
			if i == 6 && len(s2cSaved) == 0 {
				break
			}
			// handshakeLen records the length of the handshake packet from dest.
			// Here, it is judged that its length is 0 and the length of the handshake packet from dest is greater than 5.
			// REALITY/blob/main/common.go#L63
			// recordHeaderLen = 5
			if handshakeLen == 0 && len(s2cSaved) > recordHeaderLen {
				// [1:3] points to the version information of the 2nd-3rd bytes of the TLS handshake packet
				// For compatibility reasons, the 2nd-3rd bytes of the ClientHello of TLS1.3, 
				// have the same value as TLS1.2, and the version mark of 1.3 exists in the extension
				// Here we determine whether the data packet from dest is ServerHello
				// or ChangeCipherSpec or ApplicationData,
				// These three types of data packets should appear in the handshake
				if Value(s2cSaved[1:3]...) != VersionTLS12 ||
					(i == 0 && (recordType(s2cSaved[0]) != recordTypeHandshake || s2cSaved[5] != typeServerHello)) ||
					(i == 1 && (recordType(s2cSaved[0]) != recordTypeChangeCipherSpec || s2cSaved[5] != 1)) ||
					(i > 1 && recordType(s2cSaved[0]) != recordTypeApplicationData) {
					break f
				}
				// [3:5] points to the handshake packet length information of the 4th and 5th bytes of the TLS handshake packet
				handshakeLen = recordHeaderLen + Value(s2cSaved[3:5]...)
			}
			if config.Show {
				fmt.Printf("REALITY remoteAddr: %v\tlen(s2cSaved): %v\t%v: %v\n", remoteAddr, len(s2cSaved), t, handshakeLen) //for debug
			}
			// Determine whether the handshake packet is too long
			if handshakeLen > size {
				break f
			}
			// Determine whether the handshake packet type is Change Cipher Spec
			if i == 1 && handshakeLen > 0 && handshakeLen != 6 {
				break f
			}
			// Determine whether the handshake packet type is Encrypted Extensions,
			// which is the encrypted part attached after the Change Cipher Spec.
			if i == 2 && handshakeLen > 512 {
				hs.c.out.handshakeLen[i] = handshakeLen
				hs.c.out.handshakeBuf = buf[:0]
				break
			}
			// Determine whether the handshake packet type is New Session Ticket
			if i == 6 && handshakeLen > 0 {
				hs.c.out.handshakeLen[i] = handshakeLen
				break
			}
			// Determine whether the length of the handshake packet is 0 or greater than the s2cSaved length
			if handshakeLen == 0 || len(s2cSaved) < handshakeLen {
				// Unlock, cancel monopolization of current task
				mutex.Unlock()
				continue f
			}
			// Determine whether the handshake packet type is Server Hello
			if i == 0 {
				// Construct a new Server Hello
				hs.hello = new(serverHelloMsg)
				// unmarshal is used to parse the ServerHello from dest and fill it into the newly constructed handshake packet
				// Here we check whether unmarshal reports an error and whether the handshake packet after parsing and filling is legal
				if !hs.hello.unmarshal(s2cSaved[recordHeaderLen:handshakeLen]) ||
					hs.hello.vers != VersionTLS12 || hs.hello.supportedVersion != VersionTLS13 ||
					cipherSuiteTLS13ByID(hs.hello.cipherSuite) == nil ||
					hs.hello.serverShare.group != X25519 || len(hs.hello.serverShare.data) != 32 {
					break f
				}
			}
			// Modify the sent length of the corresponding type of handshake packet
			// then reset s2cSaved and handshakeLen
			hs.c.out.handshakeLen[i] = handshakeLen
			s2cSaved = s2cSaved[handshakeLen:]
			handshakeLen = 0
		} // End of traversal
		// Mark the start time of the run
		start := time.Now()
		// Handshake with REALITY client
		// That means sending modified Server Hello,
		// Change Cipher Spec and Encrypted Extensions
		err = hs.handshake()
		if config.Show {
			fmt.Printf("REALITY remoteAddr: %v\ths.handshake() err: %v\n", remoteAddr, err) //for debug
		}
		if err != nil {
			break
		}
		// Run the coroutine to handle the connection with dest. At this time, the REALITY handshake has already ended.
		// The connection to dest is no longer needed.
		// The purpose of using coroutines is to avoid blocking communication with the client.
		go func() {
			if handshakeLen-len(s2cSaved) > 0 {
				io.ReadFull(target, buf[:handshakeLen-len(s2cSaved)])
			}
			if n, err := target.Read(buf); !hs.c.isHandshakeComplete.Load() {
				if err != nil {
					conn.Close()
				}
				if config.Show {
					fmt.Printf("REALITY remoteAddr: %v\ttime.Since(start): %v\tn: %v\terr: %v\n", remoteAddr, time.Since(start), n, err)
				}
			}
		}()
		// Wait for the client to return TLS Finished information
		err = hs.readClientFinished()
		if config.Show {
			fmt.Printf("REALITY remoteAddr: %v\ths.readClientFinished() err: %v\n", remoteAddr, err)
		}
		if err != nil {
			break
		}
		hs.c.isHandshakeComplete.Store(true)
		break
	}
	// Unlock, cancel monopolization of current task
	mutex.Unlock()
	// Check if the REALITY server did not send a ServerHello.
	// This is usually triggered when dest returns an invalid ServerHello
	// or before dest returns ServerHello.
	if hs.c.out.handshakeLen[0] == 0 {
		// Determine whether dest does not process ClientHello correctly
		if hs.c.conn == conn {
			waitGroup.Add(1)
			go func() {
				// Forward all traffic to dest directly
				io.Copy(target, underlying)
				waitGroup.Done()
			}()
		}
		// Write client connection content to s2cSaved
		conn.Write(s2cSaved)
		// Forward all traffic to dest directly
		io.Copy(underlying, target)
		// When io.Copy() returns, it means that dest has closed the connection. 
		// The forwarding channel to the client should also be closed at this time
		underlying.CloseWrite()
	}
	// Notify the waiting group that the coroutine has completed running
	waitGroup.Done()
}()
```

至此，REALITY服务器完成了与客户端的握手。下面是一小段最终的处理代码：

```Go
// Block until all coroutines in the waiting group have completed running
waitGroup.Wait()
// Close the connection with dest
target.Close()
if config.Show {
	fmt.Printf("REALITY remoteAddr: %v\ths.c.handshakeStatus: %v\n", remoteAddr, hs.c.isHandshakeComplete.Load()) //for debug
}
// Determine whether the handshake with the REALITY client has ended
if hs.c.isHandshakeComplete.Load() {
	// Return the connection to the caller
	return hs.c, nil
}
// If the handshake with the REALITY client has not ended normally,
// close the connection with the client
conn.Close()
// Return the error to the caller
return nil, errors.New("REALITY: processed invalid connection")
```

After the REALITY server returns the connection, the caller (usually an upper-level proxy protocol such as VLESS) can transmit evasion traffic through the same public API provided by the reality package as [crypto/tls](https://pkg.go.dev/crypto/tls). The subsequent traffic transmission is exactly the same as the behavior of [crypto/tls](https://pkg.go.dev/crypto/tls).

### 🚀Conclusion
In this article, we have learned about the normal handshake process of the TLS1.3 protocol without ECH enabled. Based on this, we have analyzed the source code of the REALITY client and server in depth, and have gained insight into the specific implementation of the REALITY protocol to circumvent the SNI-based censorship strategy.

This article has been written non-stop since I established the blog and published the article on July 30, and it has been published today for exactly one week. I hope to provide readers with a comprehensive understanding of the REALITY protocol in the most understandable way without losing rigor, and I hope you who are reading this can gain something from it.

Finally, thanks to [RPRX](https://github.com/RPRX), the creator of [XTLS/Xray-core](https://github.com/XTLS/Xray-core/), and all the contributors to the projects under [ProjectX (XTLS)](https://github.com/XTLS).
Since there are many projects under ProjectX, only the contributors of Xray-core are listed here:

<a href="https://github.com/XTLS/Xray-core/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XTLS/Xray-core" />
</a>

(Made with [contrib.rocks](https://contrib.rocks). Access from mainland China and Iran may be slow.)

*(Recommended related reading: )*
1. [A Detailed Look at RFC 8446 (a.k.a. TLS 1.3) - Cloudflare Blog](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)
1. [Good-bye ESNI, hello ECH! - Cloudflare Blog](https://blog.cloudflare.com/encrypted-client-hello/)