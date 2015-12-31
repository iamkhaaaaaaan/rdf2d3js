# Vocab2JsonLD
This NPM module allows for the conversion of RDF/OWL vocabs to a format which can be read by D3.js.

The input format must be JSON-LD (http://www.w3.org/TR/json-ld/), I recommend this API for conversion http://rdf-translator.appspot.com/ . 

Only a few have currently been commited to this repo.

The source is well commented, so it should be very easy to understand the code. 

Included is a function to automatically fetch and parse RDF data (using api linked above). Use:

```
rdf2d3.parseToJsonLD('http://www.w3.org/ns/auth/acl', function(data){
      console.log(data);
});
```

Data is recieved using Ajax call in library.

Steps to returning propery format:
1) Find root of nodes, if no root is found, create dummy node. Use:
  ```
  rdf2d3.findRoot(graph);
  ```
  This is a non-returning function. May change this later.
  
2) Parse nodes. Use:
  ```
    var nodes = rdf2d3.findNodes(graph);
  ```
  This function retruns an object which contains all nodes, including their parents and children nodes as circular JSON.
  
3) Find links between nodes.
  ```
  var links = rdf2d3.findLinks(nodes);
  ```
  Returns links between nodes. Uses an array of known RDF/OWL linkages to find links for D3.js. TODO: add link type.
