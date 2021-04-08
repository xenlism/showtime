/usr/bin/top -c -b | head -50 | grep '%Cpu(s):' | awk '{ print $2 }'
