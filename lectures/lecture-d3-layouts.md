---
layout: code-lecture
title:  Advanced D3&#58; Layouts
permalink: /lectures/lecture-d3-layouts/
nomenu: true
---

*Material based on Scott Murray's book and [blocks](http://bl.ocks.org/mbostock/3887235) [by](http://bl.ocks.org/mbostock/4062045) Mike Bostock*

## Asynchronous Data Loading

Before we jump into the world of layouts, let's quickly cover an important aspect related to data loading. The code snippet below loads in a file called myData.json, and when all the plotting is finished, prints 'Done Plotting' to the console.

``` javascript
console.log('Hello'); // Prints Hello

// Creates an async request for a resource from the server using d3.json
async function loadData(){ 
    try{
        let data = await d3.json('myData.json');
        // This is where you insert d3 code to process and plot the data
        console.log("Data Loaded!"); // Prints when the request finishes
    }
    catch(error){
        console.error(error); // Logs error if encountered
    }
}
loadData();

console.log('World'); // Prints World
```
The question is: What is the order in which the three statements above will print to the console? Hello , World, Done Plotting  or Hello, Done Plotting, World ?


If you answered the first, Hello, World, Done Plotting, you are correct. The reason for this is because the call to d3.json is asynchronous. An *asynchronous* call is defined as one in which the script is not blocked while waiting for the called code to finish. This means that the asynchronous call is not instantaneous, and javascript does not wait for it to return before continuing to run the rest of the script. Asynchronous functions are often related to doing I/O, e.g. downloading things, reading files, talking to databases, etc.

In practice, this means that you will not have guaranteed access to the data inside MyData.json outside of the anynchronous function. So if you have something like this: 

``` javascript

// Creates an async request for a resource from the server using d3.json
async function loadData(){ 
    try{
        let data = await d3.json('myData.json');
        //Data wrangling and cleanup. 
        console.log("Done Cleaning!"); // Prints when the request finishes
    }
    catch(error){
        console.error(error); // Logs error if encountered
    }
}
loadData();

//d3 functions that will process and plot your data 

```

Your d3 functions will be called, before d3.json has returned with the data inside myData.json and you will either get an error or no visualization at all. In the above example, this conclusion is consistent with the fact that javascript variables are function scoped. We shouldn't expect to be able to access the `data` variable outside of `loadData()`. The `async`/`await` syntax shown in this example, however, is part of javascript ES6 and only available in d3 as of version 5. This is becuase, under the hood, d3 v5 uses *Promises* to handle asychronous callbacks.

### A Quick Introduction to Promises

<!-- Promises are a pattern that help with asynchronous functions that returns a single result asynchronously. In the examples above, we saw a popular way of receiving this result, which is through a callback function. This function only evaluates once the asyncronous function returns a value. This pattern looks like this: 

``` javascript
asyncFunction(arg1, arg2,
    function(result){
        console.log(result);
    });
    
```

A common problem with this approach is what is known as 'callback hell'. This happens when you have multiple asynchronous function calls and each of them must be nested within the callback of the previous one to ensure that they have access to the necessary data/results.  Here is an example of callback hell: 

``` javascript
async1(function(){
    async2(function(){
        async3(function(){
            async4(function(){
                ....
            });
        });
    });
});
```

Promises provide a better way of working with callbacks: Now an asynchronous function returns a Promise, an object that serves as a placeholder and container for the final result. Callbacks registered via the Promise method then() are notified of the result. Here is how we would fix the above example of callback hell with promises: 

``` javascript
// Callback approach
async1(function(){
    async2(function(){
        async3(function(){
            ....
        });
    });
});

// Promise approach
var task1 = async1();
var task2 = task1.then(async2);
var task3 = task2.then(async3);

task3.catch(function(){
    // Solve your thrown errors from task1, task2, task3 here
})

// Promise approach with chaining
async1(function(){..})
    .then(async2)
    .then(async3)
    .catch(function(){
        // Solve your thrown errors here
    })
``` -->

Promises are a construct for designed for asynchronous functions that returns a single result asynchronously, which provides a better way of working with callbacks. A given asynchronous function returns a Promise object, which serves as a placeholder and container for the final result. Callback functions, which are registered via the Promise methods `then()` and `catch()`, are called when result returns depending on the state (fulfilled or rejected) of the Promise object.

A promise can be:

* fulfilled - The action relating to the promise succeeded
* rejected - The action relating to the promise failed
* pending - Hasn't fulfilled or rejected yet
* settled - Has fulfilled or rejected

``` javascript
asyncWithPromise() // Returns a promise object
    .then(function(){ // if object's state is fulfilled, go here
        ...
    })
    .catch(function(){ // if object's state is rejected, go here
        ...
    })
```

Note that `promise.then()` takes two arguments, a callback for a success case, and another for the failure case. Both are optional, so you can add a callback for the success or failure case only.


``` javascript
promise.then(function(result) {
  console.log(result); // "Stuff worked!"
}, function(err) {
  console.log(err); // Error: "It broke"
});
```

So what's the difference? Essentially, `promise.then(f1).catch(f2)` reduces to `promise.then(f1, null).then(null, f2)`. This means that if the success callback function `f1` throws an error, it is caught and handled by function `f2`. In the case of `promise.then(f1, f2)`, function `f2` only handles the failure case for the original promise and ignoring any errors thrown by the `f1` callback. Both have potential [advantages/disadvantages](https://stackoverflow.com/questions/24662289/when-is-thensuccess-fail-considered-an-antipattern-for-promises), depending on how you're chaining together asynchronous calls. This ability to chain asynchronous calls is one of the major advantages of promises.

Where javascript's old asycnhronous callback syntax necessitated a design pattern of nested callbacks, affectionately known as "callback hell", Promises allow us to easily chain asychronous calls based on their respective successes and failures. 

``` javascript
// Callback Hell
async1(function(){
    async2(function(){
        async3(function(){
            ....
        });
    });
});

// Promise approach
var task1 = async1();
var task2 = task1.then(async2);
var task3 = task2.then(async3);

task3.catch(function(){
    // Solve your thrown errors from task1, task2, task3 here
})

// Promise approach with chaining
async1(function(){..})
    .then(async2)
    .then(async3)
    .catch(function(){
        // Solve your thrown errors here
    })
```

### Async/await

As our original example illustrated, ES6 introduces an even easier way of handling promises: `await`. The `await`operator will simply pause the execution of an asynchronous function until the value from the promise is available.

``` javascript 
async function getFirstUser() {
    let users = await getUsers();
    return users[0].name;
}
```

This means that we can revert to the try/catch functionality to catch errors:

```  javascript
async function getFirstUser() {
    try {
        let users = await getUsers();
        return users[0].name;
    } catch (err) {
        return {
            name: 'default user'
        };
    }
}
```

So what happens if we type this?: 

``` javascript 
let user = getFirstUser();
```

Because we didn't use the await syntax, `user` will refer to a promise object (rather than the resolved value).

It’s important to remember: async functions don’t magically wait for themselves. You must await, or you’ll get a promise instead of the value you expect.

And most importantly, remember that async/await and promises are the same thing under the hood!

<!--
Using promises has a few advantages:

* No inversion of control: similarly to synchronous code, Promise-based functions return results, they don’t (directly) continue – and control – execution via callbacks. That is, the caller stays in control.

* Chaining is simpler: If the callback of then() returns a Promise (e.g. the result of calling another Promise-based function) then then() returns that Promise (how this really works is more complicated and explained later). As a consequence, you can chain then() method calls:

``` javascript
  asyncFunction1(a, b)
  .then(result1 => {
      console.log(result1);
      return asyncFunction2(x, y);
  })
  .then(result2 => {
      console.log(result2);
  });
  
``` 

* Composing asynchronous calls (loops, mapping, etc.): is a little easier, because you have data (Promise objects) you can work with.

* Error handling: Error handling is simpler with Promises, because, once again, there isn’t an inversion of control. Furthermore, both exceptions and asynchronous errors are managed the same way.

* Cleaner signatures: With callbacks, the parameters of a function are mixed; some are input for the function, others are responsible for delivering its output. With Promises, function signatures become cleaner; all parameters are input.

* Standardized: Prior to Promises, there were several incompatible ways of handling asynchronous results (Node.js callbacks, XMLHttpRequest, IndexedDB, etc.). With Promises, there is a clearly defined standard: ECMAScript 6. ES6 follows the standard Promises/A+ [1]. Since ES6, an increasing number of APIs is based on Promises.

-->

## Layouts

Layouts make it easier to spatially arrange, shape and size elements representing data on the screen. While we've produced layouts ourselves already, we've only used simple position and size assignments that were directly driven by the data. And while these cover important classes of visualization techniques, there are more advanced techniques for different data types that are not as easily placed. Layouts are typically based on algorithms that define, e.g., where to put a node in a network visualization, or where to place a rectangle in a tree map. In this lecture we will learn how to use D3's layout features to render such complex layouts.

D3 Layouts don't actually draw things for us, rather they perform a data transformation that we can use to draw specific objects on the screen. Let's start with a simple example, a pie chart.

### Pie/Donut Charts

Pie charts are a much criticised visualization technique as they have multiple weaknesses (but also strengths) compared to their alternatives. We'll talk about those in class, but for now, we'll draw a pie chart because it's one of the simplest layouts we can do.

<!--In the following example, we use the [D3 pie layout](https://github.com/d3/d3-shape/blob/master/README.md#pie) to calculate the angles and the [d3.arc](https://github.com/d3/d3-shape#arcs) function to calculate the arcs used for drawing the wedges.-->

Let us consider the following line of code: `pie = d3.pie(data)`. It is important to note that the [`d3.pie()`](https://github.com/d3/d3-shape/blob/master/README.md#pie) call does not produce a shape directly, but computes the necessary angles to represent a dataset as a pie or donut chart. 

The data output by `d3.pie(data)` can then be used as follows: `arc = d3.arc(pie)`. 
Here, [`d3.arc()`](https://github.com/d3/d3-shape#arcs) (the arc generator) produces a circular svg shape, as in a pie or donut chart.

Let's take a closer look at the output of `d3.pie(data)`. 

* data - element
* index - of the element
* value - of the arc.
* startAngle - of the arc. The overall start angle of the pie, i.e., the start angle of the first arc.
* endAngle -  The overall end angle of the pie, i.e., the end angle of the last arc
* padAngle -  of the arc. The pad angle here means the angular separation between each adjacent arc.



{% include code.html id="d3_pie" file="d3_pie.html" code="" js="false" preview="true" %}

![Pie data structure](images/pie.png)
The interesting intermediate stages here are the values produced by the pie layout and the path drawn by the arc function. The pie layout produces a specific data object that we can use to bind to the DOM elements, shown on the right. We get an array with one object for each wedge. The first member of the object is `data`, which stores the raw data. We also have `startAngle` and `endAngle` (in radians). <br /><br /> <br /> <br /> <br />  

The path that is generated by the arc function, is the second piece of information: `M1.1634144591899855e-14,-190A190,190 0 1,1 -176.58002257840997,-70.13911623486732L0,0Z`. This defines the actual path drawn.


## Hierarchy Layouts

### Chord Layout

Chord diagrams are often used to show directed relationships among a group of entities. `d3.chord()` computes the chord layout for the specified square matrix of size n×n, where the matrix represents the directed flow amongst a network of n nodes. The given matrix must be an array of length n, where each element matrix[i] is an array of n numbers, where each matrix[i][j] represents the flow from the ith node in the network to the jth node. Each number matrix[i][j] must be nonnegative, though it can be zero if there is no flow from node i to node j. 


Here is an example dataset: 

``` javascript 
var matrix = [
  [11975,  5871, 8916, 2868],
  [ 1951, 10048, 2060, 6171],
  [ 8010, 16145, 8090, 8045],
  [ 1013,   990,  940, 6907]
];
```

We will look at 3 d3 functions in order to render a complete chord diagram. 
 
* d3.chord() - analagous to d3.pie() in our previous example, returns the data formatted properly for our svg path generator. 
* d3.arc() - path generator for the outside circle
* d3.ribbon() - path generator for the inside ribbons


The return value of d3.chord(matrix) is an array of chords, where each chord represents the combined bidirectional flow between two nodes i and j (where i may be equal to j) and is an object with the following properties:

* source - the source subgroup
* target - the target subgroup
 
Each source and target subgroup is also an object with the following properties:

* startAngle - the start angle in radians
* endAngle - the end angle in radians
* value - the flow value matrix[i][j]
* index - the node index i
* subindex - the node index j

The chords are typically passed to d3.ribbon to display the network relationships. 

The chords array also defines a secondary array of length n, chords.groups, where each group represents the combined outflow for node i, corresponding to the elements matrix[i][0 … n - 1], and is an object with the following properties:

* startAngle - the start angle in radians
* endAngle - the end angle in radians
* value - the total outgoing flow value for node i
* index - the node index i

The groups are typically passed to d3.arc to produce a donut chart around the circumference of the chord layout.


Let's step through a simple example to see how this works. Notice that our final chord diagram has two types of svg paths. The arcs that form the outer layer and the ribbons that form the connecting chords.


 

 {% include code.html id="d3_chord" file="d3_chord.html" code="" js="false" preview="true" %}

Let's wrap up Chord Diagrams with this look at a really creative use of a Chord Diagram [Lord of the Rings Chord Diagram](http://bl.ocks.org/nbremer/6599644129c034d0cb17fcdc452c310b)

### Tree Layout

Let's talk about trees, a very common layout for hierarchical data. 

d3.tree() Creates a new tree layout with default settings. 

However, before we can compute a hierarchical layout, we need a root node. If our data is already in a hierarchical format, such as JSON, we can pass it directly to d3.hierarchy; otherwise, we can rearrange tabular data, such as comma-separated values (CSV), into a hierarchy using d3.stratify.

Let's assume with have this data: 

``` javascript
{
  "name": "Eve",
  "children": [
    {
      "name": "Cain"
    },
    {
      "name": "Seth",
      "children": [
        {
          "name": "Enos"
        },
        {
          "name": "Noam"
        }
      ]
    },
    {
      "name": "Abel"
    },
    {
      "name": "Awan",
      "children": [
        {
          "name": "Enoch"
        }
      ]
    },
    {
      "name": "Azura"
    }
  ]
}
```
We can now call d3.hierarchy on this data as such:

```javascript
let root = d3.hierarchy(data[, children]) 
```

If we are provided the data in a non-hierarchical format, as if loaded a CSV file:

```javascript
[
  {"name": "Eve",   "parent": ""},
  {"name": "Cain",  "parent": "Eve"},
  {"name": "Seth",  "parent": "Eve"},
  {"name": "Enos",  "parent": "Seth"},
  {"name": "Noam",  "parent": "Seth"},
  {"name": "Abel",  "parent": "Eve"},
  {"name": "Awan",  "parent": "Eve"},
  {"name": "Enoch", "parent": "Awan"},
  {"name": "Azura", "parent": "Eve"}
]
```

Then we need to wrangle this data into a hierarchy.

This is where d3.stratify comes in. `d3.stratify()(data)` generates a new hierarchy from the specified tabular data: 

```javascript
let stratify = d3.stratify()
    .id(d => d.name)
    .parentId(d => d.parent);

let root =  stratify(data);
```

Both d3.hierarchy and d3.stratify should return a root node that looks like: 

![alt_text](./images/stratify_new.png)

This returned root node and each descendant has the following properties:

* node.data - the associated data, as specified to the constructor.
* node.depth - zero for the root node, and increasing by one for each descendant generation.
* node.height - zero for leaf nodes, and the greatest distance from any descendant leaf for internal nodes.
* node.parent - the parent node, or null for the root node.
* node.children - an array of child nodes, if any; undefined for leaf nodes.
* node.value - the summed value of the node and its descendants; optional, see node.sum and node.count.


The node objects also have two functions that will prove useful in this context:

* node.ancestors() - Returns the array of ancestors nodes, starting with this node, then followed by each parent up to the root.

* node.descendants() - Returns the array of descendant nodes, starting with this node, then followed by each child in topological order.

Once we have our root node, we can feed it into the tree layout. 

`d3.tree(root)` lays out the specified root hierarchy, assigning the following properties on root and its descendants and assigns a x and y coordinate to each node. 

* node.x - the x-coordinate of the node
* node.y - the y-coordinate of the node

{% include code.html id="d3_tree" file="d3_tree.html" code="" js="false" preview="true" %}


### Treemap Layout

Introduced by Ben Shneiderman in 1991, a treemap recursively subdivides area into rectangles according to each node’s associated value.

This example is based on [this block](https://bl.ocks.org/mbostock/8fe6fa6ed1fa976e5dd76cfa4d816fec)

For the Treemap layout we will be looking at how to convert tabular data in csv form to the final layout. 

Let's consider our input data, which looks something like this: 

```  csv
size,path
90,d3/d3-array/array.js
86,d3/d3-array/ascending.js
238,d3/d3-array/bisect.js
786,d3/d3-array/bisector.js
72,d3/d3-array/constant.js
86,d3/d3-array/descending.js
```

Because our final layout is meant to represent hierarchical data, we must first wrangle this table into a hierarchy using d3.stratify. Once we have our root, we can then use d3.treemap() to get our layout/positions: 

`d3.treemap()` - Creates a new treemap layout with default settings.

`treemap(root)` - Lays out the specified root hierarchy, assigning the following properties on root and its descendants:

* node.x0 - the left edge of the rectangle
* node.y0 - the top edge of the rectangle
* node.x1 - the right edge of the rectangle
* node.y1 - the bottom edge of the rectangle

Note that you must call root.sum before passing the hierarchy to the treemap layout. You probably also want to call root.sort to order the hierarchy before computing the layout. Any ideas why? 
 

{% include code.html id="d3_tree_map" file="d3_tree_map.html" code="" js="false" preview="true" %}



## Network Layouts

### Node Link Force-Directed Graph Layout

We've mainly talked about tabluar data up to this point. As we will soon learn, there are other data forms. A major other data form is the graph or network. Graphs describe relations between elements. The elements are usually referred to as nodes or vertices, the relationships as links or edges. A common, but not the only representation for graphs are node link diagrams, where nodes are often rendered as circles and edges as lines connecting the circles. There are many ways to lay the nodes in a graph out. We could have all nodes on a circle, or in a grid, or use some other method for laying them out. A common method is a force-directed layout. The idea behind a force directed layout is a physical model: the nodes repulse each other, while the edges are considered springs that pull each other close. The idea behind this is that as nodes that are tightly connected will be close to each other, i.e., form visible clusters, whereas nodes that are not connected are far from each other. The D3 implementation does not actually model this as springs, but as [geometric constraints](https://github.com/d3/d3-force#link_distance), but the mental model is still useful.

 This happens in an iterative process, i.e., the forces for each node to each other node are calculated in a single step and the system is adjusted, then the next loop starts, etc. Eventually, the system will (hopefully) find an equilibrium. This is computationally expensive, as we will learn, but works fine for smaller graphs.

The following example illustrates a node-link diagram based on character co-occurrences in Les Miserables. It is based on the [standard D3 force layout example](http://bl.ocks.org/mbostock/4062045).

The data is stored in [a json file](miserables.json). Here is a sample of this file:

{% highlight javascript linenos %}
{
  "nodes":[
    {"id":"Myriel","group":1},
    {"id":"Napoleon","group":1},
    {"id":"Mlle.Baptistine","group":1},
    {"id":"Mme.Magloire","group":1},
    {"id":"CountessdeLo","group":1}
  ],
  "links":[
    {"source": "Napoleon", "target": "Myriel", "value": 1},
    {"source": "Mlle.Baptistine", "target": "Myriel", "value": 8},
    {"source": "Mme.Magloire", "target": "Myriel", "value": 10},
    {"source": "Mme.Magloire", "target": "Mlle.Baptistine", "value": 6},
    {"source": "CountessdeLo", "target": "Myriel", "value": 1}

  ]
}
{% endhighlight %}

The file contains a list of nodes, followed by a list of edges (links), a common format to store graph data. In the array of `nodes`, we have objects with the values `id` and `group`, the `links` array contain the edges that are defined via a `source` and `target`, which are the ids of the source and target nodes respectively).


First we will used D3's [d3-fetch module](https://github.com/d3/d3-fetch), specifically the JSON method to load the data. Two things are important to note:

 1. Once the  data is loaded it will be available in an object, just as we see it in the json file.
 2. The d3-request methods load **asynchronously**. That means that we'll not get a return value from the loading function right away, but rather pass a function that is executed when the data loading is complete. The benefit of the asynchronous function is, of course, that other processes can continue, e.g., a user interface wouldn't freeze up while a dataset is loaded.

We then use the [force layout](https://github.com/d3/d3-force) to calculate the initial positions and update them in "ticks":


## Forces

A force is simply a function that can be used to modify nodes’ positions or velocities. A force can apply a classical physical force such as electrical charge or gravity, or it can resolve a geometric constraint, such as keeping nodes within a bounding box or keeping linked nodes a fixed distance apart. 

Possible forces include: 

* Links
* Many-Body
* Centering
* Collision
* Positioning

Here is how you would start a new simulation with a specifie array of nodes and no forces. If nodes is not specified, it defaults to the empty array. 

``` javascript
var simulation = d3.forceSimulation();
``` 

In order to add forces, we use the .force syntax as such: 

``` javascript 
simulation 
     .force("link", d3.forceLink().id(d => d.id))
     .force("charge", d3.forceManyBody())
     .force("center", d3.forceCenter(width / 2, height / 2));   
``` 

 These happen to be the three forces that are at play in the example we will look through below. In order to understand their effect, let's take a look at what happens when we remove each one.
 
 ![alt_text](./images/force_layout.gif)
 
### forceLink()
 
 The link force pushes linked nodes together or apart according to the desired link distance. When we remove it, there is nothing keeping the nodes together. 
 
``` javascript 
simulation 
     .force("charge", d3.forceManyBody())
     .force("center", d3.forceCenter(width / 2, height / 2));
```

![alt_text](./images/no_link.gif)


The syntax for forceLink() is as follows: 

``` javascript 
d3.forceLink().id(d => d.id))
```
If id is specified, sets the node id accessor to the specified function and returns this force.
 
If id is not specified, returns the current node id accessor, which defaults to the numeric index of the node: 

``` javascript
function id(d, i) {
  return i;
}
``` 
 
### forceManyBody()

The many-body force applies mutually amongst all nodes. It can be used to simulate gravity (attraction) if the strength is positive, or electrostatic charge (repulsion) if the strength is negative.

You can set the strength of this force with d3.forceManyBody().strength([strength]). If strength is not specified, returns the current strength accessor, which defaults to -30. 
 
``` javascript 
simulation      
     .force("link", d3.forceLink().id(d => d.id))
     .force("center", d3.forceCenter(width / 2, height / 2));
```

![alt_text](./images/no_charge.gif)

### forceCenter()

The centering force translates nodes uniformly so that the mean position of all nodes is at the given position ⟨x,y⟩

``` javascript
simulation 
     .force("link", d3.forceLink().id(d => d.id))
     .force("charge", d3.forceManyBody())
```
![alt_text](./images/no_center.gif)

### forceCollide()

The collision force treats nodes as circles with a given radius, rather than points, and prevents nodes from overlapping

``` javascript
simulation 
     .force("collide", d3.forceCollide([50])
```

![alt_text](./images/collide.gif)


### d3.forceX([X]) / d3.forceY([y])

The x- and y- positioning forces push nodes towards a desired position along the given dimension with a configurable strength.


To fix a node in a given position, specify:
fx - the node’s fixed x-position
fy - the node’s fixed y-position

![alt_text](./images/fixed_node.gif)


### Rendering the Simulation
So we've created a simulation and added forces, now we assign nodes to the simulation: 

``` javascript
simulation
     .nodes(graph.nodes)
```

Each node must be an object. The following properties are assigned by the simulation:

* index - the node’s zero-based index into nodes
* x - the node’s current x-position
* y - the node’s current y-position
* vx - the node’s current x-velocity
* vy - the node’s current y-velocity

If we used the `forceLink()` force, we must assign the actual link data to this force: 

``` javascript
 simulation.force("link")
       .links(graph.links);
```

Each link is an object with the following properties:

* source - the link’s source node; 
* target - the link’s target node; 
* index - the zero-based index into links, assigned by this method

Let's check out a complete example: 

{% include code.html id="d3_force" file="d3_force.html" code="" js="false" preview="true" %}


The layout uses a "cooling" factor that stops the iteration cycle.

And to wrap up [a cool example using custom made forces!](http://slides.com/vasturiano/unconf2017#/8)



### Other Layouts

There are many other layouts that can be very valuable, for. We'll revisit the layouts in class when we talk about the specific techniques they implement, but the principle is always the same: they take data and calculate derived data, which you then can use to position/scale graphical primitives on the canvas. You shouldn't have a hard time understanding any of the other layout examples.
