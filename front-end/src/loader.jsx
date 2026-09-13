import React, { useState } from "react";
import ReactDOM from 'react-dom/client';
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import './index.css';
  
function display(netNodes, netEdges) {
    document.getElementById('mynetwork').setAttribute("style","width:700px");
    document.getElementById('mynetwork').setAttribute("style","height:600px");
    const data = {
        nodes: netNodes,
        edges: netEdges
    };
    var options = {
        edges: {
            chosen: false
        },
        nodes: {
            chosen: false
        },
        physics: {
            enabled: true,
            stabilization: false,
            repulsion: {
                centralGravity: 0.2,
                springLength: 300,
                springConstant: 0.5,
                nodeDistance: 100,
                damping: 0.09
              },
        },
        /*repulsion: {
            centralGravity: 0.2,
            springLength: 200,
            springConstant: 0.01,
            nodeDistance: 100,
            damping: 0.09
          },*/
    };
    let container = document.getElementById("mynetwork");
    const network = new Network(container, data, options);
    network.setOptions(options)
    console.log("lsdhfoihesfouhsof")
}

function Graph(props) {
    const [nn, setNumNodes] = useState(5);
    const [netNodes, changeNodes] = useState(new DataSet([]));
    const [netEdges, changeEdges] = useState(new DataSet([]));
    let container = document.getElementById("mynetwork");
    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        const timerId = setInterval(() => {
            setNumNodes(nn+1);
          }, 6000);
        //let curtime = new Date();
        //console.log(curtime)
        //console.log(ltime)
        //if (curtime-ltime > 1000) {

        //    setltime(curtime)
        //}
        var ids = netNodes.getIds();
        for (let i = 0; i < ids.length; i++)
            netNodes.remove(ids[i]);
        //nodes = new DataSet([]);
        netEdges.clear();
        for (let i = 0; i < nn; i++) {
            netNodes.add({ id: i});
            /*if (i != 0) {
                netEdges.add({
                    from: 0, to :i,
                    label:'848484',
                });
            }*/
            //console.log(i);
        }
        let cid = 0
        for (let i = 0; i < nn*2; i++)
            {
                let r1 = Math.floor(Math.random()*nn);
                let r2 = Math.floor(Math.random()*nn);
                //let ew = Math.floor(1+Math.random()*9);
                if (r1 != r2) {
                    netEdges.add({
                        id: cid,
                        from: r1, to :r2, 
                        //label: ew.toString(),
                    });
                    cid++;
                }
            }
        
        //for (let i = 0; i < nn; i++)
        //    console.log(vish[i])
        display(netNodes, netEdges);
        //network.setOptions(options)
    })
    const tr = (
        <div>
            {/* <input type="text" id="number" name="number" />
            <br></br>
            <button type="button" onClick={() => {
                const elem = document.getElementById('number')
                if(typeof elem !== 'undefined' && elem !== null && elem.value > 1 && elem.value <= 30) {
                    setNumNodes(elem.value);
                    console.log('donesetting')
                    console.log('tr');
                }
            }}>Submit</button> */}
        </div>
    );
    return tr;
}



function LoaderGraph() {
    return (
        <div>
            <div id="cont">
                <div id="mynetwork"></div>
                <Graph/>
            </div>
        </div>
    );
}

export default LoaderGraph
