#!/bin/bash
for port in `seq 8081 8100`; do
	PROFILING_ENV=true NODE_ENV='production' PORT=$port npm start &
done
