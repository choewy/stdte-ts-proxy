#!/bin/bash

source /home/ubuntu/proxy/docker

loop=0
bootstrap=false

while [ $loop -le 5 ]
do
  ((loop++))

  status="$(curl --silent --head -X GET http://localhost:8000/health | awk '/^HTTP/{print $2}')"

  if [ "$status" == "200" ]; then
    bootstrap=true
    break
  fi

  sleep 5s
done


if [ $bootstrap == false ]; then
  echo "fail bootstrap ${PREFIX}"

  exit 1
fi

echo "success bootstrap ${PREFIX}"

if [ -d "/home/ubuntu/proxy" ]; then
  rm -rf /home/ubuntu/proxy
fi

sudo docker image prune -a --force
sudo docker container prune --force

exit 0