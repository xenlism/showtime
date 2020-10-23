cat /etc/*-release | grep PRETTY | sed 's/\n//g' | sed 's/\r//g' | sed 's/PRETTY_NAME=//' | sed 's/"//g'
