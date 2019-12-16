SERVER="http://localhost:3000"

ADDACTIVITY="$SERVER/devices/addActivity"
JSONFILE="addActivity/addActivity1.json"

curl -X POST -H "Content-Type: application/json" -d @$JSONFILE $ADDACTIVITY

printf "\n" # curl by default does not print newline
