```
dig kostrumahku.aniqu.biz.id

; <<>> DiG 9.11.3-1ubuntu1.18-Ubuntu <<>> kostrumahku.aniqu.biz.id
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 59424
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;kostrumahku.aniqu.biz.id.      IN      A

;; ANSWER SECTION:
kostrumahku.aniqu.biz.id. 288   IN      A       104.21.44.95
kostrumahku.aniqu.biz.id. 288   IN      A       172.67.198.131

;; Query time: 3 msec
;; SERVER: 192.168.100.1#53(192.168.100.1)
;; WHEN: Mon Nov 23 07:37:28 UTC 2026
;; MSG SIZE  rcvd: 85

```

```
│ 10 │ backend_Kostrumah    │ default     │ N/A     │ fork    │ 29187    │ 18m    │ 4    │ online    │ 0%       │ 7.5mb    │ root     │ disabled │
```

```
ps aux --sort=-%mem | grep bun\ start:bun
root     29187  0.0  0.4 1166448 7684 ?        Ss   07:36   0:00 bun start:bun
root     30021  0.0  0.0   4376   620 pts/0    S+   07:56   0:00 grep --color=auto bun start:bun
```

```
  PID COMMAND         %CPU %MEM   RSS    VSZ
29187 bun              0.0  0.4  7684 1166448
```