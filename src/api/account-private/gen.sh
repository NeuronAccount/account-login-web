#!/usr/bin/env bash

rm -rf ./gen/
mkdir gen

swagger-codegen generate -i swagger.json -l typescript-fetch -o ./gen