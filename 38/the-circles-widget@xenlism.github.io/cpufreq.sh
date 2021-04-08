cpu_fre_cmd=$(lscpu | grep MHz | grep "CPU MHz:" | awk '{ print $3}');
cpu_min_cmd=$(lscpu | grep MHz | grep "CPU min MHz:" | awk '{ print $4}');
cpu_max_cmd=$(lscpu | grep MHz | grep "CPU max MHz:" | awk '{ print $4}');
echo ${cpu_fre_cmd} ${cpu_min_cmd} ${cpu_max_cmd}; 
