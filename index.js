/*
 *   By Saadit Khan
 *
 */

/*
 * Finds root of vocab (type === owl:ontology) else inserts dummy root and returns root object
 *
 */
exports.findRoot = function(graph) {
  var root;
  graph.forEach(function(d) {
    if (d["@type"] !== undefined) {
      if (d["@type"] === "owl:Ontology") {
        root = d["@id"];
        return root;
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
    return root;
  }
}

/*
* Finds children nodes, returns object.
*
*/
exports.findNodes = function(nodes, root) {

  var map = []; //declare map

  nodes.forEach(function(d) { //
    if (d["@id"] !== undefined) {
      if (d.children === undefined) {
        d.children = []; //create array property for children
      }
      map[d["@id"]] = d;
    }
  });

  map["properties"] = {
    "@id": "properties",
    children: [],
    parent: map[root]
  }; //populate and pepare map
  map[root].children.push(map["properties"]);

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

        node.parent = map["properties"];
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
}

/*
* Finds links between nodes in format {source: , target: }
*/
exports.findLinks = function(nodes){
  var map = [],
    links = [];

  nodes.forEach(function(d) {
    if (d["@id"] !== undefined) {
      map[d["@id"]] = d;
    }
  });
  map["properties"] = {
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

      if(d[prop]["@list"]!==undefined){//if @list exists
        d[prop]["@list"].forEach(function(x){
          var l = {};
          l.source = map[d["@id"]];
          l.target = map[x["@id"]];
          l.type = "range";
          if (linkObjectEmpty(l)) {
            links.push(l);
          }
        });

      }else if (Array.isArray(d[prop])) {
          d[prop].forEach(function(x) {//if pure array
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
}

/*
* Helper functions
*/
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}
