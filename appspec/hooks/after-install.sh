#!/bin/bash

source /home/ubuntu/proxy/profile

sudo docker login -u AWS -p $(aws ecr get-login-password) $REGISTRY
sudo docker pull $IMAGE_PATH

docker="/home/ubuntu/proxy/docker"

image_id="$(sudo docker images --filter=reference=*/$IMAGE_NAME --format "{{.ID}}")"
prefix=stdte-ts-proxy

echo "PREFIX=$prefix" >> $docker
echo "IMAGE_ID=$image_id" >> $docker

exit 0