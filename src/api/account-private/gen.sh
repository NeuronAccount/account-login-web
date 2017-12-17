#!/usr/bin/env bash

rm -rf ./gen/
mkdir gen

swagger-codegen generate \
    -t ~/work/neuron/src/github.com/NeuronFramework/restful/js_template/typescript-fetch/ \
    -i swagger.json -l typescript-fetch -o ./gen