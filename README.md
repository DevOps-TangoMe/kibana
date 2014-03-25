# Kibana with custom extensions

## Overview

Kibana with custom panels:
* uniqueTerms

### Requirements
* uniqueTerms panel requires unique-terms elasticsearch plugin to be installed (https://github.com/DevOps-TangoMe/elasticsearch-unique-terms-plugin.git)

### Building

1. Install node & npm
2. $ npm install -g grunt-cli
3. In kibana folder:
    $ npm install
    $ grunt build

   This will build the following artifacts:
    * kibana/dist/*
   This can be packaged and directly installed as elasticsearch plugin or deployed on a webserver.

### Configuration

1. Elasticsearch connection URL can be configured in kibana/dist/config.js.

### FAQ
__Q__: If _unique query took a long time I see that kibana finishes request before server responses.
__A__: If you are using LB and/or Proxy to connect to elasticsearch nodes, than you need to make sure that LB and/or Proxy timeouts are configured properly and are more than expected _unique query execution time.

