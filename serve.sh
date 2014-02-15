#!/bin/bash
export NODE_ENV=development
PORT=$1

if [ -z $PORT ]; then
	PORT=8080
fi

npm install

`npm bin`/serve -p $PORT
