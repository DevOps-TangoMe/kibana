# Kibana with custom extensions

## Overview

Kibana with custom panels:
* uniqueTerms

### Requirements
<<<<<<< HEAD
* Elasticsearch 0.90.9 or above
* A modern web browser. The latest version of Chrome, Safari and Firefox have all been tested to
work. IE9 and greater should work. IE8 does not.
* A webserver. No extensions are required, as long as it can serve plain html it will work
* A browser reachable Elasticsearch server. Port 9200 must be open, or a proxy configured to allow
access to it.

### Docs

Documentation, panel options and tutorials can be found at 
[http://www.elasticsearch.org/guide/en/kibana/current/](http://www.elasticsearch.org/guide/en/kibana/current/)

### Installation
=======
* uniqueTerms panel requires unique-terms elasticsearch plugin to be installed (https://github.com/DevOps-TangoMe/elasticsearch-unique-terms-plugin.git)
>>>>>>> --Added uniqueTerms panel that in conjunction with unique-terms ES plugin allows to show unique terms count per specific index field within specific time period

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

__Q__ : If _unique query took a long time I see that kibana 
finishes request before server responses. Why is that?

__A__ : If you are using LB and/or Proxy to connect 
to elasticsearch nodes, than you need to make sure that LB and/or Proxy timeouts 
are configured properly and are more than expected _unique query execution time.

