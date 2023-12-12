#!/bin/bash

source /home/ubuntu/proxy/docker

loop=0
bootstrap=false

while [ $loop -le 5 ]
do
  ((loop++))

  status="$(curl --silent --head -X GET http://localhost:${REPLACE}/health | awk '/^HTTP/{print $2}')"

  if [ "$status" == "200" ]; then
    bootstrap=true
    break
  fi

  sleep 5s
done


if [ $bootstrap == false ]; then
  echo "fail bootstrap ${REPLACE}"

  container="$PREFIX-$REPLACE"

  if [ "$(sudo docker container inspect --format '{{.Name}}' $container 2>&1)" == "/$container" ]; then
    container_id=`sudo docker rm -f $container`
    echo "remove replace container $container_id"
  fi
  
  exit 1
fi

if [ $bootstrap == true ]; then
  echo "success bootstrap ${REPLACE}"

  container="$PREFIX-$ORIGIN"

  if [ "$(sudo docker container inspect --format '{{.Name}}' $container 2>&1)" == "/$container" ]; then
    container_id=`sudo docker stop $container`
    echo "stop origin container $container_id"
  fi
fi

if [ -d "/home/ubuntu/proxy" ]; then
  rm -rf /home/ubuntu/proxy
fi

sudo docker image prune -a --force
sudo docker container prune --force

exit 0