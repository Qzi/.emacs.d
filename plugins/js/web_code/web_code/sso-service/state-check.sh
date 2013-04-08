#! /bin/bash

echo 'Concurrent Connections on SSO(port 52561): '$(netstat -an | grep 52561 |wc -l)
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'