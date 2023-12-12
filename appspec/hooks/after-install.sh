#!/bin/bash

source /home/ubuntu/proxy/profile

sudo docker login -u AWS -p $(aws ecr get-login-password) $REGISTRY
sudo docker pull $IMAGE_PATH

docker="/home/ubuntu/proxy/docker"

image_id="$(sudo docker images --filter=reference=*/$IMAGE_NAME --format "{{.ID}}")"
prefix=stdte-ts-proxy

echo "PREFIX=$prefix" >> $docker
echo "IMAGE_ID=$image_id" >> $docker

ports=(8000 8001)

for (( i = 0; i < ${#ports[@]}; i++ )); do
  port=${ports[$i]}
  container="$prefix-$port"

  if [ "$(sudo docker container inspect --format '{{.Name}}' $container 2>&1)" == "/$container" ]; then
    echo "ORIGIN=$port" >> $docker
  else
    echo "REPLACE=$port" >> $docker
  fi
done

exit 0