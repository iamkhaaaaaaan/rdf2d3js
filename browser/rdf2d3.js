rdf2d3 = window.rdf2d3 || {}; //create object if it doesnt exist

rdf2d3 = function() {

  var root = "root";
  var properties = ["rdfs:range", "rdfs:domain", "rdf:type", "rdfs:subClassOf", "rdfs:subPropertyOf", "rdfs:subPropertyOf", "owl:equivalentClass", "rdfs:subClassOf", "owl:disjointWith", "owl:complementOf", "owl:unionOf", "owl:intersectionOf", "owl:equivalentProperty", "owl:inverseOf", "owl:sameAs", "owl:differentFrom", "owl:AllDifferent"];



  findRoot = function(graph) {
    var root;
    graph.forEach(function(d) {
      if (d["@type"] !== undefined) {
        if (d["@type"] === "owl:Ontology") {
          root = d["@id"];
          // return root;
        }
      }
    });
    if (root === undefined) {
      root = "root";
      var l = {
        "@id": root,
        children: []
      };
      graph.push(l);
      // return root;
    }
  };

  findNodes = function(nodes) {

    var map = []; //declare map
    console.log("printing nodes..");
    console.log(nodes);

    nodes.forEach(function(d) { //
      if (d["@id"] !== undefined) {
        if (d.children === undefined) {
          d.children = []; //create array property for children
        }
        map[d["@id"]] = d;
      }
    });

    map.properties = {
      "@id": "properties",
      children: [],
      parent: map[root]
    }; //populate and pepare map
    map[root].children.push(map.properties);

    function findChildren(name, n) { //recursive children finder function
      var node = map[name],
        type;

      if (node !== undefined) {
        node = map[name];
        type = node["@type"];

        //if type is ontology
        if (type == "owl:Ontology" || node["@id"] == root) {
          node.parent = null;
          return node;
        } //root

        if (type == "owl:Class" || type == "rdfs:Class") {
          if (!isInArray(node, map[root].children)) {
            node.parent = map[root]; //chnage to root function later
            node.parent.children.push(node);
            return node;
          }
        } //if type class, parent = root

        //if type is property
        if (!(type in map)) {

          node.parent = map.properties;
          node.parent.children.push(node);
          return node;
        } else {
          if (node["@id"] !== undefined) {
            if (type != "owl:Ontology" || node["@id"] != root) {
              node.parent = findChildren(type);
              node.parent.children.push(node);
            }
          }
        }
      }
      return node;
    }

    //initiates recursion to find children
    if (nodes.length) {
      nodes.forEach(function(d) {
        findChildren(d["@id"], d);
      }); //iterate over every node
    }
    return map[root];
  };

  /*
   * Finds links between nodes in format {source: , target: }
   */
  findLinks = function(nodes) {
    var map = [],
      links = [];

    nodes.forEach(function(d) {
      if (d["@id"] !== undefined) {
        map[d["@id"]] = d;
      }
    });
    map.properties = {
      "@id": "properties",
      children: [],
      parent: root
    };

    nodes.forEach(function(d) {
      properties.forEach(function(x) {
        findLinksForProp(x, d); //iterate over all properties in array
      });
    });

    //generic function for finding links between nodes using a property parameter
    function findLinksForProp(prop, d) {
      if (d[prop] !== undefined) {

        if (d[prop]["@list"] !== undefined) { //if @list exists
          d[prop]["@list"].forEach(function(x) {
            var l = {};
            l.source = map[d["@id"]];
            l.target = map[x["@id"]];
            l.type = "range";
            if (linkObjectEmpty(l)) {
              links.push(l);
            }
          });

        } else if (Array.isArray(d[prop])) {
          d[prop].forEach(function(x) { //if pure array
            var l = {};
            l.source = map[d["@id"]];
            l.target = map[x["@id"]];
            l.type = "range";
            if (linkObjectEmpty(l)) {
              links.push(l);
            }
          });

        } else {
          var l = {};
          l.source = map[d["@id"]];
          l.target = map[d[prop]["@id"]];
          l.type = "range";
          if (linkObjectEmpty(l)) {
            links.push(l);
          }
        }
      }
    }


    function linkObjectEmpty(l) { //checks if both source and target are not empty
      if (l.source !== undefined && l.target !== undefined) {
        return true;
      } else {
        return false;
      }
    }

    return links;
  };

  /*
   * Helper functions
   */
  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }

  parseToJsonLD = function(uri, callback) {
    $.ajax({
      url: 'http://rdf-translator.appspot.com/convert/detect/json-ld/' + uri,
      type: 'GET',
      success: function(data) {
        try {
          if(typeof(callback) == "function"){
            callback(data);
          }
        } catch (err) {
          console.log(err);
        }
      },
      error: function(e) {
        console.log("API request Error");
      }
    });
  };

  return {
    "findRoot": findRoot,
    "findNodes": findNodes,
    "findLinks": findLinks,
    "parseToJsonLD": parseToJsonLD
  };

}();
