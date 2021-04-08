cat /proc/cpuinfo | grep "model name" |  head -n 1 | sed 's/model name\t: //g'
