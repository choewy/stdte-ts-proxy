#!/bin/bash

source /home/ubuntu/proxy/docker

if [ "$(sudo docker container inspect --format '{{.Name}}' $PREFIX 2>&1)" == "/$PREFIX" ]; then
  container_id=`sudo docker rm -f $PREFIX`
  echo "remove container $container_id"
fi

sudo docker run \
  --name $PREFIX -d \
  -p 8000:8000 \
  -v /home/ubuntu/public:/var/proxy/public \
  -v /home/ubuntu/logs:/var/proxy/logs \
  --network=net \
  --restart=always \
  $IMAGE_ID

exit 0