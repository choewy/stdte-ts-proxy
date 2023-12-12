#!/bin/bash

source /home/ubuntu/proxy/docker

container="$PREFIX-$REPLACE"

sudo docker run \
  --name $container -d \
  -p ${REPLACE}:8000 \
  -v /home/ubuntu/public:/var/proxy/public \
  -v /home/ubuntu/logs:/var/proxy/logs \
  --network=net \
  --restart=always \
  $IMAGE_ID

exit 0