// Dijkstra Algorithm Example
// - Using suite data structure make algorithm clearer

// compile graph data to vertices structure: {"label": Vertex, ...}
// - Graph: [{from: "label", to: "label". cost: number}, ...]
// - Vertex: {label: string, edges: [{dest: Vertex, cost: number}, ...]}
var compileVertices = function (graph) {
    var vs = {};
    graph.forEach(function (edge) {
        if (!vs[edge.from]) vs[edge.from] = {label: edge.from, edges: []};
        if (!vs[edge.to]) vs[edge.to] = {label: edge.to, edges: []};
        vs[edge.from].edges.push({dest: vs[edge.to], cost: edge.cost});
        vs[edge.to].edges.push({dest: vs[edge.from], cost: edge.cost});
    });
    return vs;
};

// find the least cost route from vertex start to vertex goal
// - returns: {cost: number, route: [start, ..., goal]}
var findRoute = function (start, goal) {
    var less = function (a, b) {return a.cost < b.cost;};
    var pqueue = [];
    pqueuePush(pqueue, {cost: 0, route: [start]}, less);
    while (true) {
        var min = pqueuePop(pqueue);
        var last = min.route[min.route.length - 1];
        if (last === goal) return min;
        last.edges.forEach(function (edge) {
            if (min.route.indexOf(edge.dest) >= 0) return; //[OPT]cut back link
            var node = {
                cost: min.cost + edge.cost,
                route: min.route.concat([edge.dest])
            };
            pqueuePush(pqueue, node, less);
        });
    }
};

// utility: priority queue
var pqueuePush = function (pqueue, value, less) {
    for (var i = 0; i < pqueue.length; i++) {
        if (less(value, pqueue[i])) {
            pqueue.splice(i, 0, value);
            return;
        }
    }
    pqueue.push(value);
};
var pqueuePop = function (pqueue) {
    return pqueue.shift();
};