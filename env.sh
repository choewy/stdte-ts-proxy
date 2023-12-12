#!/bin/bash

if ! [ -e ".env.local" ]; then
  cp .env .env.local
fi

exit 0