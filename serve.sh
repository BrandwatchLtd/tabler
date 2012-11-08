PORT=$1

if [ -z $PORT ]; then
	PORT=8080
fi

npm install -d

./node_modules/.bin/serve -p $PORT
