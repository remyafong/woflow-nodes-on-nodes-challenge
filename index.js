import fetch from "node-fetch";

// Add node ids to a queue
// Fetch node data
// Use a map to keep track of node ids and occurrences
// Takes about 2s
const traverseTree = async function(id) {
    let queue = [];
    const nodeMap = new Map();
    nodeMap.set(id, 1);

    queue.push(id);
    while (queue.length > 0) {
        // Takes all ids from queue
        let ids = queue;
        queue = [];

        // Fetch data for ids
        const data = await fetchData(ids.join());
        if (data && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                const child_ids = data[i].child_node_ids;
                for (let j = 0; j < child_ids.length; j++) {
                    if (nodeMap.has(child_ids[j])) {
                        // Increment occurence count for id
                        nodeMap.set(child_ids[j], nodeMap.get(child_ids[j])+1);
                    }
                    else {
                        // Add new entry for id
                        nodeMap.set(child_ids[j], 1);
                        // Only need to explore id if we haven't seen it before
                        queue.push(child_ids[j]);
                    }
                }
            }
        }
    }

    let maxNodeOccurences = 0;
    let mostCommonNodeId = id;
    // Determine the node id that appeared the most
    for (let [key, value] of  nodeMap.entries()) {
        if (value > maxNodeOccurences) {
            maxNodeOccurences = value;
            mostCommonNodeId = key;
        }
    }

    return { numUniqueNodes: nodeMap.size, mostCommonNodeId: mostCommonNodeId };
}

const fetchData = async function(ids) {
    const response = await fetch(`https://nodes-on-nodes-challenge.herokuapp.com/nodes/${ids}`,
    {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
          }
    });
    const data = await response.json();
    return data;
}

const result = traverseTree('089ef556-dfff-4ff2-9733-654645be56fe');
result.then(value => {
    // 1. What is the total number of unique nodes?
    console.log(`The total number of unique nodes is ${value.numUniqueNodes}.`);
    // 2. Which node ID is shared the most among all other nodes?
    console.log(`The node ID shared most among all other nodes is ${value.mostCommonNodeId}.`);
})

// --------------------------------------------------------------------------------------------------------- //

// My initial implementation is below. This method does one request per node id
// Much slower because it makes one fetch per id (~9s)
const traverseTree2 = async function(id) {
    const queue = [];
    const nodeMap = new Map();

    queue.push(id);
    while (queue.length > 0) {
        let id = queue.shift();

        if (nodeMap.has(id)) {
            nodeMap.set(id, nodeMap.get(id)+1);
        }
        else {
            nodeMap.set(id, 1);
        }

        const data = await fetchData2(id);
        if (data && data.length > 0) {
            const child_ids = data[0].child_node_ids;
            for (let i = 0; i < child_ids.length; i++) {
                queue.push(child_ids[i]);
            }
        }
    }

    let maxNodeOccurences = 0;
    let mostCommonNodeId = id;
    for (let [key, value] of  nodeMap.entries()) {
        if (value > maxNodeOccurences) {
            maxNodeOccurences = value;
            mostCommonNodeId = key;
        }
    }

    return { numUniqueNodes: nodeMap.size, mostCommonNodeId: mostCommonNodeId };
}

const fetchData2 = async function(id) {
    const response = await fetch(`https://nodes-on-nodes-challenge.herokuapp.com/nodes/${id}`,
    {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
          }
    });
    const data = await response.json();
    return data;
}

// const result2 = traverseTree2('089ef556-dfff-4ff2-9733-654645be56fe');
// result2.then(value => {
//     // 1. What is the total number of unique nodes?
//     console.log(`The total number of unique nodes is ${value.numUniqueNodes}.`);
//     // 2. Which node ID is shared the most among all other nodes?
//     console.log(`The node ID shared most among all other nodes is ${value.mostCommonNodeId}.`);
// })