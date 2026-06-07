// ==========================================
// A-GAME PLAYBOOK (FLOWCHART & MINDMAP)
// ==========================================

var pbData = {
    nodes: {},
    edges: []
};
var pbCurrentLayer = "root";
var pbLayerHistory = [{id: "root", name: "Root"}]; 
var pbScale = 1;
var pbPanX = 0;
var pbPanY = 0;
var pbIsDraggingCanvas = false;
var pbIsDraggingNode = false;
var pbActiveNodeId = null;
var pbConnectMode = false;
var pbConnectSourceId = null;
var pbStartX, pbStartY;
var pbCanvasWrapper, pbCanvas, pbSvg;
var pbActiveEdge = null;

document.addEventListener('DOMContentLoaded', function() {
    pbCanvasWrapper = document.getElementById('pb-canvas-wrapper');
    pbCanvas = document.getElementById('pb-canvas');
    pbSvg = document.getElementById('pb-svg');
    
    // Context Menu Logic
    function hideMenu(e) {
        let menu = document.getElementById('pbEdgeContextMenu');
        if(menu && e.target.id !== 'pbEdgeBtnEdit' && e.target.id !== 'pbEdgeBtnDelete') {
            menu.style.display = 'none';
        }
    }
    document.addEventListener('mousedown', hideMenu);
    document.addEventListener('touchstart', hideMenu, {passive: true});
    
    let btnEdit = document.getElementById('pbEdgeBtnEdit');
    if(btnEdit) {
        function editEdge(e) {
            e.stopPropagation();
            if(pbActiveEdge) {
                let label = prompt("Beschriftung für diesen Pfeil (leer lassen zum Entfernen):", pbActiveEdge.label || "");
                if (label !== null) {
                    pbActiveEdge.label = label;
                    pbSave();
                    pbRender();
                }
            }
            document.getElementById('pbEdgeContextMenu').style.display = 'none';
        }
        btnEdit.addEventListener('mousedown', editEdge);
        btnEdit.addEventListener('touchstart', editEdge, {passive: false});
    }
    
    let btnDelete = document.getElementById('pbEdgeBtnDelete');
    if(btnDelete) {
        function deleteEdge(e) {
            e.stopPropagation();
            if(pbActiveEdge) {
                let idx = pbData.edges.indexOf(pbActiveEdge);
                if(idx > -1) {
                    pbData.edges.splice(idx, 1);
                    pbSave();
                    pbRender();
                }
            }
            document.getElementById('pbEdgeContextMenu').style.display = 'none';
        }
        btnDelete.addEventListener('mousedown', deleteEdge);
        btnDelete.addEventListener('touchstart', deleteEdge, {passive: false});
    }

    if (pbCanvasWrapper) {
        pbInitEvents();
        pbInitPlaybooks();
    }
});

// --- PLAYBOOK MANAGER ---
var pbPlaybooksIndex = [];
var pbCurrentPlaybookId = 'grapp_playbook_data'; // Default fallback

function pbInitPlaybooks() {
    let indexData = localStorage.getItem('grapp_playbooks_index');
    if (indexData) {
        pbPlaybooksIndex = JSON.parse(indexData);
    } else {
        // Migration: Create index with default playbook
        pbPlaybooksIndex = [{id: 'grapp_playbook_data', name: 'A-Game Playbook'}];
        localStorage.setItem('grapp_playbooks_index', JSON.stringify(pbPlaybooksIndex));
    }
    
    let lastUsed = localStorage.getItem('grapp_playbook_last_used');
    if (lastUsed && pbPlaybooksIndex.find(p => p.id === lastUsed)) {
        pbCurrentPlaybookId = lastUsed;
    } else {
        pbCurrentPlaybookId = pbPlaybooksIndex[0].id;
    }
    
    pbUpdateSelector();
    pbLoadData();
}

function pbUpdateSelector() {
    let sel = document.getElementById('pbPlaybookSelect');
    if(!sel) return;
    sel.innerHTML = '';
    pbPlaybooksIndex.forEach(p => {
        let opt = document.createElement('option');
        opt.value = p.id;
        opt.innerText = p.name;
        if (p.id === pbCurrentPlaybookId) opt.selected = true;
        sel.appendChild(opt);
    });
}

function pbSwitchPlaybook(id) {
    pbCurrentPlaybookId = id;
    localStorage.setItem('grapp_playbook_last_used', id);
    pbCurrentLayer = 'root';
    pbLayerHistory = [{id: 'root', name: 'Root'}];
    pbLoadData();
}

function pbCreateNew() {
    let name = prompt("Name des neuen Playbooks:");
    if (!name) return;
    let newId = 'pb_' + Date.now();
    pbPlaybooksIndex.push({id: newId, name: name});
    localStorage.setItem('grapp_playbooks_index', JSON.stringify(pbPlaybooksIndex));
    
    // Create empty data
    localStorage.setItem(newId, JSON.stringify({nodes:{}, edges:[]}));
    
    pbUpdateSelector();
    pbSwitchPlaybook(newId);
}

function pbClone() {
    let currentPb = pbPlaybooksIndex.find(p => p.id === pbCurrentPlaybookId);
    let currentName = currentPb ? currentPb.name : 'Playbook';
    let name = prompt("Name des geklonten Playbooks:", currentName + " (Kopie)");
    if (!name) return;
    let newId = 'pb_' + Date.now();
    pbPlaybooksIndex.push({id: newId, name: name});
    localStorage.setItem('grapp_playbooks_index', JSON.stringify(pbPlaybooksIndex));
    
    // Copy current data
    localStorage.setItem(newId, JSON.stringify(pbData));
    
    pbUpdateSelector();
    pbSwitchPlaybook(newId);
}

function pbRename() {
    let currentPb = pbPlaybooksIndex.find(p => p.id === pbCurrentPlaybookId);
    if (!currentPb) return;
    let name = prompt("Neuer Name:", currentPb.name);
    if (!name) return;
    currentPb.name = name;
    localStorage.setItem('grapp_playbooks_index', JSON.stringify(pbPlaybooksIndex));
    pbUpdateSelector();
}

function pbDeletePlaybook() {
    if (pbPlaybooksIndex.length <= 1) {
        alert("Du kannst das letzte Playbook nicht löschen!");
        return;
    }
    if (confirm("Möchtest du dieses Playbook wirklich löschen? Dieser Schritt kann nicht rückgängig gemacht werden.")) {
        localStorage.removeItem(pbCurrentPlaybookId);
        pbPlaybooksIndex = pbPlaybooksIndex.filter(p => p.id !== pbCurrentPlaybookId);
        localStorage.setItem('grapp_playbooks_index', JSON.stringify(pbPlaybooksIndex));
        
        pbSwitchPlaybook(pbPlaybooksIndex[0].id);
        pbUpdateSelector();
    }
}

function pbLoadData() {
    pbData = {nodes: {}, edges: []};
    var saved = localStorage.getItem(pbCurrentPlaybookId);
    if (saved) {
        try {
            pbData = JSON.parse(saved);
            if (!pbData.nodes) pbData.nodes = {};
            if (!pbData.edges) pbData.edges = [];
        } catch(e) {}
    }
    
    if (pbCanvasWrapper) {
        pbCenterView(false);
    }
    
    pbRender();
}

function pbSave() {
    localStorage.setItem(pbCurrentPlaybookId, JSON.stringify(pbData));
}

// --- RENDERING ---
function pbRender() {
    if(!pbCanvas) return;
    
    // Clear old nodes
    var oldNodes = pbCanvas.querySelectorAll('.pb-node');
    oldNodes.forEach(n => n.remove());
    
    // Clear SVG
    pbSvg.innerHTML = '';
    
    // Draw Edges
    pbData.edges.forEach(edge => {
        if (edge.layer === pbCurrentLayer) {
            pbDrawEdge(edge);
        }
    });
    
    // Draw Nodes
    for (let id in pbData.nodes) {
        let node = pbData.nodes[id];
        if (node.layer === pbCurrentLayer) {
            let el = document.createElement('div');
            el.className = 'pb-node';
            el.id = 'node_' + id;
            el.style.left = node.x + 'px';
            el.style.top = node.y + 'px';
            
            // Apply styles
            let icon = '';
            if (node.style === 'offensive') { el.style.borderLeft = '4px solid #2ecc71'; }
            if (node.style === 'defense') { el.style.borderLeft = '4px solid #e74c3c'; icon = '⚠️ '; }
            if (node.style === 'submission') { el.style.border = '2px solid #f1c40f'; el.style.boxShadow = '0 0 10px rgba(241,196,15,0.5)'; icon = '🔥 '; }
            if (node.style === 'note') { el.style.background = 'transparent'; el.style.border = 'none'; el.style.color = '#aaa'; el.style.fontStyle = 'italic'; }
            
            if (node.type === 'shortcut') {
                el.style.borderStyle = 'dashed';
                icon += '🔗 ';
            }
            
            // Highlight if connect source
            if (pbConnectMode && pbConnectSourceId === id) {
                el.style.borderColor = '#f1c40f';
                el.style.boxShadow = '0 0 15px rgba(241, 196, 15, 0.8)';
            }
            
            // Indicate if it's a folder (has children)
            let hasChildren = Object.values(pbData.nodes).some(n => n.layer === id);
            
            el.innerHTML = '<span>' + icon + node.text + '</span>';
            if(hasChildren && node.type !== 'shortcut') {
                el.innerHTML += '<div style="position:absolute; top:-5px; right:-5px; background:#e67e22; color:#fff; font-size:9px; width:15px; height:15px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 5px #000;">+</div>';
            }
            if(node.video) {
                el.innerHTML += `<a href="${node.video}" target="_blank" style="position:absolute; top:-10px; left:-10px; font-size:16px; text-decoration:none; background:#222; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.5); z-index:10;" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()">🎬</a>`;
            }
            
            // Events
            el.addEventListener('mousedown', (e) => pbNodeDown(e, id));
            el.addEventListener('touchstart', (e) => pbNodeDown(e, id), {passive: false});
            
            pbCanvas.appendChild(el);
        }
    }
    
    // Render Breadcrumbs
    let bc = document.getElementById('pb-breadcrumbs');
    if(bc) {
        let html = '';
        pbLayerHistory.forEach((h, i) => {
            html += `<span onclick="pbGoToLayerIndex(${i})" style="cursor:pointer; padding:2px 5px; background:#111; border-radius:4px; margin-right:5px; border:1px solid #333;">${h.name}</span> `;
            if (i < pbLayerHistory.length - 1) html += ' > ';
        });
        bc.innerHTML = html;
    }
}

function pbDrawEdge(edge) {
    let n1 = pbData.nodes[edge.source];
    let n2 = pbData.nodes[edge.target];
    if(!n1 || !n2) return;
    
    let x1 = n1.x + 60; // center of node
    let y1 = n1.y + 25;
    let x2 = n2.x + 60;
    let y2 = n2.y + 25;
    
    // Shift points to the borders of the node (120x50 approx)
    let dx = x2 - x1;
    let dy = y2 - y1;
    let cp1x, cp1y, cp2x, cp2y;
    
    // Check if there is a reverse edge to curve them apart
    let hasReverse = pbData.edges.some(e => e.source === edge.target && e.target === edge.source);
    let isReverse = hasReverse && edge.source > edge.target;
    let offset = hasReverse ? (isReverse ? -35 : 35) : 0;
    
    if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical connection
        if (dy > 0) { y1 += 25; y2 -= 25; } else { y1 -= 25; y2 += 25; }
        cp1x = x1 + offset;
        cp1y = y1 + (y2 - y1) / 2;
        cp2x = x2 + offset;
        cp2y = y1 + (y2 - y1) / 2;
        x1 += offset * 0.3;
        x2 += offset * 0.3;
    } else {
        // Horizontal connection
        if (dx > 0) { x1 += 60; x2 -= 60; } else { x1 -= 60; x2 += 60; }
        cp1x = x1 + (x2 - x1) / 2;
        cp1y = y1 + offset;
        cp2x = x1 + (x2 - x1) / 2;
        cp2y = y2 + offset;
        y1 += offset * 0.3;
        y2 += offset * 0.3;
    }
    
    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`);
    path.setAttribute('stroke', '#3498db');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    
    // ... [Arrow markers code handled later or before, wait, arrow marker definition is here]
    if (!document.getElementById('arrowhead')) {
        let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        let marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '12');
        marker.setAttribute('markerHeight', '12');
        marker.setAttribute('refX', '11');
        marker.setAttribute('refY', '6');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'userSpaceOnUse');
        let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 2, 12 6, 0 10');
        polygon.setAttribute('fill', '#3498db');
        marker.appendChild(polygon);
        
        let markerRev = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        markerRev.setAttribute('id', 'arrowhead_start');
        markerRev.setAttribute('markerWidth', '12');
        markerRev.setAttribute('markerHeight', '12');
        markerRev.setAttribute('refX', '1');
        markerRev.setAttribute('refY', '6');
        markerRev.setAttribute('orient', 'auto');
        markerRev.setAttribute('markerUnits', 'userSpaceOnUse');
        let polygonRev = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygonRev.setAttribute('points', '12 2, 0 6, 12 10');
        polygonRev.setAttribute('fill', '#3498db');
        markerRev.appendChild(polygonRev);
        
        defs.appendChild(marker);
        defs.appendChild(markerRev);
        pbSvg.appendChild(defs);
    }
    
    path.setAttribute('marker-end', 'url(#arrowhead)');
    if (edge.bidirectional) {
        path.setAttribute('marker-start', 'url(#arrowhead_start)');
    }
    
    g.appendChild(path);
    
    // Hitbox Path for much easier clicking (25px thick)
    let hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hitPath.setAttribute('d', `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`);
    hitPath.setAttribute('stroke', 'rgba(0,0,0,0)');
    hitPath.setAttribute('stroke-width', '30');
    hitPath.setAttribute('fill', 'none');
    hitPath.style.pointerEvents = 'stroke';
    hitPath.style.cursor = 'pointer';
    
    function showMenu(e, clientX, clientY) {
        e.preventDefault(); 
        e.stopPropagation(); 
        
        // VISUAL FEEDBACK: Turn edge red when clicked
        path.setAttribute('stroke', '#e74c3c');
        
        pbActiveEdge = edge;
        let menu = document.getElementById('pbEdgeContextMenu');
        if(menu) {
            document.body.appendChild(menu); // Move to body to prevent ANY CSS clipping
            menu.style.position = 'fixed';
            menu.style.display = 'block';
            menu.style.left = clientX + 'px';
            menu.style.top = clientY + 'px';
            menu.style.zIndex = '999999';
        }
    }
    
    hitPath.addEventListener('mousedown', (e) => {
        showMenu(e, e.clientX, e.clientY);
    });
    
    hitPath.addEventListener('touchstart', (e) => {
        if(e.touches && e.touches.length > 0) {
            showMenu(e, e.touches[0].clientX, e.touches[0].clientY);
        }
    }, {passive: false});
    
    g.appendChild(hitPath);
    pbSvg.appendChild(g);
    
    if (edge.label) {
        let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (x1 + x2) / 2);
        text.setAttribute('y', (y1 + y2) / 2 - 8);
        text.setAttribute('fill', '#f1c40f');
        text.setAttribute('font-size', '12px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('pointer-events', 'none');
        text.style.textShadow = '0px 0px 4px #000, 0px 0px 4px #000, 0px 0px 4px #000';
        text.textContent = edge.label;
        pbSvg.appendChild(text);
    }
}

function pbUpdateTransform() {
    pbCanvas.style.transform = `translate(${pbPanX}px, ${pbPanY}px) scale(${pbScale})`;
}

function pbCenterView(animate = true, targetNodeId = null) {
    if(!pbCanvasWrapper || !pbCanvas) return;
    
    let targetPanX = 0, targetPanY = 0, targetScale = 1;

    if (targetNodeId && pbData.nodes[targetNodeId]) {
        let n = pbData.nodes[targetNodeId];
        let cx = n.x + 60;
        let cy = n.y + 25;
        
        targetScale = 1.5; // Zoom in directly on the node
        targetPanX = (pbCanvasWrapper.clientWidth / 2) - (cx * targetScale);
        targetPanY = (pbCanvasWrapper.clientHeight / 2) - (cy * targetScale);
    } else {
        let layerNodes = Object.values(pbData.nodes).filter(n => n.layer === pbCurrentLayer);
        
        if (layerNodes.length === 0) {
            targetScale = 1;
            targetPanX = -1500 + (pbCanvasWrapper.clientWidth / 2);
            targetPanY = -1500 + (pbCanvasWrapper.clientHeight / 2);
        } else {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            layerNodes.forEach(n => {
                if(n.x < minX) minX = n.x;
                if(n.y < minY) minY = n.y;
                if(n.x > maxX) maxX = n.x;
                if(n.y > maxY) maxY = n.y;
            });
            
            let contentWidth = (maxX - minX) + 160; 
            let contentHeight = (maxY - minY) + 80;
            let cx = minX + contentWidth / 2 - 80;
            let cy = minY + contentHeight / 2 - 40;
            
            let padding = 100;
            let scaleX = pbCanvasWrapper.clientWidth / (contentWidth + padding * 2);
            let scaleY = pbCanvasWrapper.clientHeight / (contentHeight + padding * 2);
            
            targetScale = Math.min(2.5, Math.max(0.3, Math.min(scaleX, scaleY)));
            targetPanX = (pbCanvasWrapper.clientWidth / 2) - (cx * targetScale);
            targetPanY = (pbCanvasWrapper.clientHeight / 2) - (cy * targetScale);
        }
    }
    
    pbScale = targetScale;
    pbPanX = targetPanX;
    pbPanY = targetPanY;
    
    if (animate) {
        pbCanvas.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        pbUpdateTransform();
        setTimeout(() => { pbCanvas.style.transition = 'none'; }, 400);
    } else {
        pbCanvas.style.transition = 'none';
        pbUpdateTransform();
    }
}

function pbAutoLayout() {
    let layerNodesList = Object.values(pbData.nodes).filter(n => n.layer === pbCurrentLayer);
    if(layerNodesList.length === 0) return;
    
    let layerEdges = pbData.edges.filter(e => {
        let s = pbData.nodes[e.source];
        let t = pbData.nodes[e.target];
        return s && t && s.layer === pbCurrentLayer && t.layer === pbCurrentLayer;
    });

    // Force-Directed Graph Layout (Fruchterman-Reingold)
    let iterations = 250;
    let k = 250; // Optimal distance between nodes
    let temperature = 100;
    let gravity = 0.05; // Keeps disconnected components from flying away

    let disp = {};
    
    // Add small random jitter if nodes are perfectly stacked (prevents division by zero)
    layerNodesList.forEach(n => {
        n.x += (Math.random() - 0.5) * 10;
        n.y += (Math.random() - 0.5) * 10;
        disp[n.id] = {x: 0, y: 0};
    });

    for (let i = 0; i < iterations; i++) {
        layerNodesList.forEach(v => { disp[v.id] = {x: 0, y: 0}; });
        
        // Repulsion
        for (let a = 0; a < layerNodesList.length; a++) {
            for (let b = a + 1; b < layerNodesList.length; b++) {
                let v = layerNodesList[a];
                let u = layerNodesList[b];
                let dx = v.x - u.x;
                let dy = v.y - u.y;
                let dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
                let force = (k * k) / dist;
                let fx = (dx / dist) * force;
                let fy = (dy / dist) * force;
                
                disp[v.id].x += fx;
                disp[v.id].y += fy;
                disp[u.id].x -= fx;
                disp[u.id].y -= fy;
            }
        }
        
        // Attraction (Edges)
        layerEdges.forEach(e => {
            let v = pbData.nodes[e.source];
            let u = pbData.nodes[e.target];
            if (v && u) {
                let dx = v.x - u.x;
                let dy = v.y - u.y;
                let dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
                let force = (dist * dist) / k;
                let fx = (dx / dist) * force;
                let fy = (dy / dist) * force;
                
                disp[v.id].x -= fx;
                disp[v.id].y -= fy;
                disp[u.id].x += fx;
                disp[u.id].y += fy;
            }
        });
        
        // Gravity (Pull to absolute center of canvas so nothing gets clipped)
        let cx = 1500, cy = 1500;
        
        layerNodesList.forEach(v => {
            let dx = v.x - cx;
            let dy = v.y - cy;
            disp[v.id].x -= dx * gravity;
            disp[v.id].y -= dy * gravity;
        });
        
        // Update positions with temperature limit
        layerNodesList.forEach(v => {
            let dx = disp[v.id].x;
            let dy = disp[v.id].y;
            let dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
            let limit = Math.min(dist, temperature);
            v.x += (dx / dist) * limit;
            v.y += (dy / dist) * limit;
        });
        
        temperature *= 0.95; // Cool down
    }
    
    // Optional: Snap to a loose grid to make it look slightly neater
    layerNodesList.forEach(v => {
        v.x = Math.round(v.x / 20) * 20;
        v.y = Math.round(v.y / 20) * 20;
    });

    pbSave();
    pbCenterView(true);
    pbRender();
}

function pbZoom(dir, e = null) {
    let oldScale = pbScale;
    
    if(dir > 0) pbScale += 0.1;
    else pbScale -= 0.1;
    if(pbScale < 0.2) pbScale = 0.2;
    if(pbScale > 3) pbScale = 3;
    
    let rect = pbCanvasWrapper.getBoundingClientRect();
    let cx = rect.width / 2;
    let cy = rect.height / 2;
    
    if (e && e.clientX !== undefined) {
        cx = e.clientX - rect.left;
        cy = e.clientY - rect.top;
    }
    
    let ratio = pbScale / oldScale;
    pbPanX = cx - (cx - pbPanX) * ratio;
    pbPanY = cy - (cy - pbPanY) * ratio;
    
    pbUpdateTransform();
}

// --- NODE CREATION & EDITING ---
function pbAddNode() {
    var id = 'node_' + Date.now();
    // Place at center of current view
    var cx = (-pbPanX + pbCanvasWrapper.clientWidth/2) - 60;
    var cy = (-pbPanY + pbCanvasWrapper.clientHeight/2) - 25;
    
    pbData.nodes[id] = {
        id: id,
        layer: pbCurrentLayer,
        text: 'New Move',
        x: cx,
        y: cy,
        style: 'neutral',
        type: 'normal'
    };
    pbSave();
    pbRender();
}

var editingNodeId = null;
function pbOpenNodeEditor(id) {
    editingNodeId = id;
    let node = pbData.nodes[id];
    if(!node) return;
    
    document.getElementById('pbNodeText').value = node.text;
    document.getElementById('pbNodeVideo').value = node.video || '';
    document.getElementById('pbNodeStyle').value = node.style || 'neutral';
    document.getElementById('pbNodeType').value = node.type || 'normal';
    
    // Populate shortcut target list
    let targetSelect = document.getElementById('pbNodeShortcutTarget');
    targetSelect.innerHTML = '';
    for(let nId in pbData.nodes) {
        if(nId !== id) {
            let n = pbData.nodes[nId];
            let opt = document.createElement('option');
            opt.value = nId;
            opt.innerText = n.text + " (Layer: " + (n.layer === 'root' ? 'Root' : 'Sub') + ")";
            if(node.shortcutTarget === nId) opt.selected = true;
            targetSelect.appendChild(opt);
        }
    }
    
    document.getElementById('pbShortcutWrapper').style.display = (node.type === 'shortcut') ? 'block' : 'none';
    
    let btnEnter = document.getElementById('pbBtnEnterLayer');
    if(btnEnter) {
        if(node.type === 'shortcut') {
            btnEnter.innerText = '🔗 Zum verlinkten Knoten springen';
        } else {
            btnEnter.innerText = '📂 In diese Ebene (Layer) abtauchen';
        }
    }
    
    document.getElementById('pbNodeModal').style.display = 'flex';
}

function pbSaveNode() {
    if(editingNodeId && pbData.nodes[editingNodeId]) {
        pbData.nodes[editingNodeId].text = document.getElementById('pbNodeText').value;
        pbData.nodes[editingNodeId].video = document.getElementById('pbNodeVideo').value.trim();
        pbData.nodes[editingNodeId].style = document.getElementById('pbNodeStyle').value;
        pbData.nodes[editingNodeId].type = document.getElementById('pbNodeType').value;
        pbData.nodes[editingNodeId].shortcutTarget = document.getElementById('pbNodeShortcutTarget').value;
        pbSave();
        pbRender();
    }
    document.getElementById('pbNodeModal').style.display = 'none';
}

function pbDeleteNode() {
    if(editingNodeId) {
        delete pbData.nodes[editingNodeId];
        // Clean up edges
        pbData.edges = pbData.edges.filter(e => e.source !== editingNodeId && e.target !== editingNodeId);
        // We could also delete orphaned children layers, but for simplicity let them be garbage.
        pbSave();
        pbRender();
    }
    document.getElementById('pbNodeModal').style.display = 'none';
}

// --- LAYERS ---
function pbEnterLayer() {
    if(editingNodeId && pbData.nodes[editingNodeId]) {
        let node = pbData.nodes[editingNodeId];
        document.getElementById('pbNodeModal').style.display = 'none';
        
        let targetLayerId = node.id;
        let targetName = node.text;
        let flashTargetId = null;
        
        // Handle Shortcut Jump
        if (node.type === 'shortcut') {
            let selectedTargetId = document.getElementById('pbNodeShortcutTarget').value;
            if (selectedTargetId && pbData.nodes[selectedTargetId]) {
                // Save it so it's persisted immediately
                node.shortcutTarget = selectedTargetId;
                pbSave();
                
                let targetNode = pbData.nodes[selectedTargetId];
                targetLayerId = targetNode.layer; // Jump to the layer of the target node
                targetName = "Shortcut -> " + targetNode.text;
                flashTargetId = targetNode.id;
            } else {
                alert("Bitte wähle zuerst einen gültigen Ziel-Knoten im Dropdown-Menü aus!");
                // Don't close the modal, let them fix it
                document.getElementById('pbNodeModal').style.display = 'flex';
                return;
            }
        }
        
        pbCurrentLayer = targetLayerId;
        pbLayerHistory.push({id: targetLayerId, name: targetName});
        
        if (flashTargetId) {
            pbCenterView(false, flashTargetId);
            pbRender();
            
            // Flash the target node so the user sees exactly what they jumped to
            setTimeout(() => {
                let el = document.getElementById('node_' + flashTargetId);
                if(el) {
                    el.style.transition = 'all 0.4s';
                    let oldBg = el.style.background;
                    let oldBoxShadow = el.style.boxShadow;
                    
                    el.style.background = '#e74c3c';
                    el.style.boxShadow = '0 0 30px #e74c3c, 0 0 50px #e74c3c';
                    
                    setTimeout(() => {
                        el.style.background = oldBg;
                        el.style.boxShadow = oldBoxShadow || 'none';
                        setTimeout(() => { el.style.transition = 'none'; }, 400);
                    }, 600);
                }
            }, 50);
            
        } else {
            pbCenterView(false); // Auto center whole layer without animation
            pbRender();
        }
    }
}

function pbGoToLayerIndex(index) {
    if (index >= 0 && index < pbLayerHistory.length) {
        pbLayerHistory = pbLayerHistory.slice(0, index + 1);
        pbCurrentLayer = pbLayerHistory[pbLayerHistory.length - 1].id;
        pbCenterView(false); // Auto center without animation
        pbRender();
    }
}

// --- CONNECT MODE ---
function pbSetMode(mode) {
    let btnMove = document.getElementById('pbModeMove');
    let btnLink = document.getElementById('pbModeLink');
    
    if (mode === 'link') {
        pbConnectMode = true;
        if(btnMove) { btnMove.style.background = 'transparent'; btnMove.style.color = '#888'; }
        if(btnLink) { btnLink.style.background = '#e74c3c'; btnLink.style.color = '#fff'; }
        pbConnectSourceId = null;
        pbEnsureTempEdge();
    } else {
        pbConnectMode = false;
        if(btnLink) { btnLink.style.background = 'transparent'; btnLink.style.color = '#888'; }
        if(btnMove) { btnMove.style.background = '#3498db'; btnMove.style.color = '#fff'; }
        pbConnectSourceId = null;
        
        let tempLine = document.getElementById('pbTempEdge');
        if(tempLine) tempLine.style.display = 'none';
    }
    pbRender();
}

// --- EVENTS ---
var pbHasMoved = false;
var pbEventCache = [];

function pbInitEvents() {
    pbCanvasWrapper.addEventListener('mousedown', pbCanvasDown);
    pbCanvasWrapper.addEventListener('mousemove', pbCanvasMove);
    window.addEventListener('mouseup', pbMouseUp);
    
    pbCanvasWrapper.addEventListener('touchstart', pbCanvasDown, {passive: false});
    pbCanvasWrapper.addEventListener('touchmove', pbCanvasMove, {passive: false});
    window.addEventListener('touchend', pbMouseUp);
    
    pbCanvasWrapper.addEventListener('wheel', function(e) {
        e.preventDefault();
        if(e.deltaY < 0) pbZoom(1, e);
        else pbZoom(-1, e);
    }, {passive: false});
}

function pbCanvasDown(e) {
    if (e.target.closest('.pb-node') || e.target.closest('.btn-sm')) return; // handled by node / buttons
    
    pbIsDraggingCanvas = true;
    pbHasMoved = false;
    let pt = getPoint(e);
    pbStartX = pt.x - pbPanX;
    pbStartY = pt.y - pbPanY;
}

function pbEnsureTempEdge() {
    let svg = document.getElementById('pb-svg');
    if(svg && !document.getElementById('pbTempEdge')) {
        let tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempLine.setAttribute('id', 'pbTempEdge');
        tempLine.setAttribute('stroke', '#e74c3c');
        tempLine.setAttribute('stroke-dasharray', '5,5');
        tempLine.setAttribute('stroke-width', '3');
        tempLine.setAttribute('fill', 'none');
        tempLine.style.display = 'none';
        tempLine.style.pointerEvents = 'none';
        svg.appendChild(tempLine);
    }
}

function pbNodeDown(e, id) {
    e.preventDefault(); // prevent touch scroll
    e.stopPropagation();
    
    if (pbConnectMode) {
        pbConnectSourceId = id;
        pbRender(); // highlight
        pbEnsureTempEdge();
        let tempLine = document.getElementById('pbTempEdge');
        if(tempLine) tempLine.style.display = 'block';
        
        pbIsDraggingNode = true; // so mousemove fires
        pbHasMoved = false;
        
        let pt = getPoint(e);
        pbStartX = pt.x;
        pbStartY = pt.y;
        return;
    }
    
    pbIsDraggingNode = true;
    pbActiveNodeId = id;
    pbHasMoved = false;
    
    let pt = getPoint(e);
    let node = pbData.nodes[id];
    
    // We store the initial offset between pointer and node
    pbStartX = pt.x - (node.x * pbScale);
    pbStartY = pt.y - (node.y * pbScale);
    
    // Show trash zone
    let tz = document.getElementById('pbTrashZone');
    if(tz) tz.style.display = 'block';
}

var pbPinchCenterX = 0;
var pbPinchCenterY = 0;

function pbCanvasMove(e) {
    e.preventDefault();
    
    // Pinch to zoom
    if (e.touches && e.touches.length >= 2) {
        let dist = getPinchDist(e);
        if (pbInitialPinchDist === null) {
            pbInitialPinchDist = dist;
            pbInitialScale = pbScale;
            
            let cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            let cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            let rect = pbCanvasWrapper.getBoundingClientRect();
            pbPinchCenterX = cx - rect.left;
            pbPinchCenterY = cy - rect.top;
        } else {
            let oldScale = pbScale;
            let ratio = dist / pbInitialPinchDist;
            pbScale = pbInitialScale * ratio;
            if (pbScale < 0.2) pbScale = 0.2;
            if (pbScale > 3) pbScale = 3;
            
            let scaleRatio = pbScale / oldScale;
            pbPanX = pbPinchCenterX - (pbPinchCenterX - pbPanX) * scaleRatio;
            pbPanY = pbPinchCenterY - (pbPinchCenterY - pbPanY) * scaleRatio;
            
            pbUpdateTransform();
        }
        return; // Don't pan while pinching
    }
    
    if (pbConnectMode && pbConnectSourceId) {
        let tempLine = document.getElementById('pbTempEdge');
        if (tempLine && tempLine.style.display !== 'none') {
            let srcNode = pbData.nodes[pbConnectSourceId];
            if (srcNode) {
                let x1 = srcNode.x + 60;
                let y1 = srcNode.y + 25;
                let pt = getPoint(e);
                let rect = pbCanvasWrapper.getBoundingClientRect();
                let x2 = (pt.x - rect.left - pbPanX) / pbScale;
                let y2 = (pt.y - rect.top - pbPanY) / pbScale;
                
                let dx = x2 - x1;
                let dy = y2 - y1;
                let cp1x, cp1y, cp2x, cp2y;
                
                if (Math.abs(dy) > Math.abs(dx)) {
                    if (dy > 0) { y1 += 25; } else { y1 -= 25; }
                    cp1x = x1;
                    cp1y = y1 + (y2 - y1) / 2;
                    cp2x = x2;
                    cp2y = y1 + (y2 - y1) / 2;
                } else {
                    if (dx > 0) { x1 += 60; } else { x1 -= 60; }
                    cp1x = x1 + (x2 - x1) / 2;
                    cp1y = y1;
                    cp2x = x1 + (x2 - x1) / 2;
                    cp2y = y2;
                }
                
                tempLine.setAttribute('d', `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`);
            }
        }
        return; // Don't pan canvas while connecting
    }
    
    if (!pbIsDraggingCanvas && !pbIsDraggingNode) return;
    
    let pt = getPoint(e);
    pbHasMoved = true;
    
    if (pbIsDraggingCanvas) {
        pbPanX = pt.x - pbStartX;
        pbPanY = pt.y - pbStartY;
        pbUpdateTransform();
    } 
    else if (pbIsDraggingNode && pbActiveNodeId) {
        let node = pbData.nodes[pbActiveNodeId];
        // Convert screen delta back to canvas space
        node.x = (pt.x - pbStartX) / pbScale;
        node.y = (pt.y - pbStartY) / pbScale;
        
        let el = document.getElementById('node_' + pbActiveNodeId);
        if(el) {
            el.style.left = node.x + 'px';
            el.style.top = node.y + 'px';
        }
        
        // Fast redraw of SVG only
        pbSvg.innerHTML = '';
        pbData.edges.forEach(edge => {
            if (edge.layer === pbCurrentLayer) pbDrawEdge(edge);
        });
    }
}

function pbMouseUp(e) {
    pbInitialPinchDist = null; // Reset pinch
    
    // Connect Mode Drop
    if (pbConnectMode && pbConnectSourceId) {
        let tempLine = document.getElementById('pbTempEdge');
        if (tempLine) tempLine.style.display = 'none';
        
        let targetNodeEl = null;
        if(e.changedTouches && e.changedTouches.length > 0) {
            let touch = e.changedTouches[0];
            let targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
            if(targetEl) targetNodeEl = targetEl.closest('.pb-node');
        } else {
            if(e.target) targetNodeEl = e.target.closest('.pb-node');
        }
        
        if (targetNodeEl) {
            let id = targetNodeEl.id.replace('node_', '');
            if (id && id !== pbConnectSourceId) {
                // Check if reverse edge already exists
                let existingRevEdge = pbData.edges.find(edge => edge.layer === pbCurrentLayer && String(edge.source) === String(id) && String(edge.target) === String(pbConnectSourceId));
                let existingFwdEdge = pbData.edges.find(edge => edge.layer === pbCurrentLayer && String(edge.source) === String(pbConnectSourceId) && String(edge.target) === String(id));
                
                if (existingFwdEdge) {
                    // Already connected this way, do nothing
                } else if (existingRevEdge) {
                    existingRevEdge.bidirectional = true;
                    pbSave();
                } else {
                    pbData.edges.push({source: pbConnectSourceId, target: id, layer: pbCurrentLayer});
                    pbSave();
                }
                pbRender();
            }
        }
        pbConnectSourceId = null;
        return;
    }
    
    // Trash Zone Drop
    let tz = document.getElementById('pbTrashZone');
    
    if (pbIsDraggingNode && pbHasMoved && pbActiveNodeId && tz && tz.style.display !== 'none') {
        // Check if dropped in trash zone
        let pt = null;
        if(e.changedTouches && e.changedTouches.length > 0) {
            pt = {clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY};
        } else {
            pt = {clientX: e.clientX, clientY: e.clientY};
        }
        
        if (pt) {
            let rect = tz.getBoundingClientRect();
            if (pt.clientX >= rect.left && pt.clientX <= rect.right &&
                pt.clientY >= rect.top && pt.clientY <= rect.bottom) {
                
                if(confirm("Diesen Knoten wirklich löschen?")) {
                    delete pbData.nodes[pbActiveNodeId];
                    pbData.edges = pbData.edges.filter(edge => edge.source !== pbActiveNodeId && edge.target !== pbActiveNodeId);
                    pbSave();
                    pbRender();
                    pbIsDraggingNode = false;
                    pbActiveNodeId = null;
                    tz.style.display = 'none';
                    return;
                }
            }
        }
    }
    
    if (tz) tz.style.display = 'none';
    
    if (pbIsDraggingNode && !pbHasMoved && pbActiveNodeId) {
        // It was a click!
        pbOpenNodeEditor(pbActiveNodeId);
    }
    
    if (pbIsDraggingNode) {
        pbSave(); // save new position
    }
    
    pbIsDraggingCanvas = false;
    pbIsDraggingNode = false;
    pbActiveNodeId = null;
}

var pbInitialPinchDist = null;
var pbInitialScale = 1;

function getPoint(e) {
    if (e.touches && e.touches.length > 0) {
        return {x: e.touches[0].clientX, y: e.touches[0].clientY};
    }
    return {x: e.clientX, y: e.clientY};
}

function getPinchDist(e) {
    if (e.touches && e.touches.length >= 2) {
        let dx = e.touches[0].clientX - e.touches[1].clientX;
        let dy = e.touches[0].clientY - e.touches[1].clientY;
        return Math.sqrt(dx*dx + dy*dy);
    }
    return null;
}


// --- EXPORT FROM GAMEFINDER ---
function exportGamefinderToPlaybook() {
    // We create a new Layer for the Gamefinder export
    var layerId = 'layer_gf_' + Date.now();
    
    // Create root node that points to this layer
    var rootNodeId = 'node_' + Date.now();
    pbData.nodes[rootNodeId] = {
        id: rootNodeId,
        layer: 'root',
        text: 'Gamefinder Profil',
        x: (-pbPanX + pbCanvasWrapper.clientWidth/2) - 60,
        y: (-pbPanY + pbCanvasWrapper.clientHeight/2) - 25
    };
    
    // Read GF selections
    var moves = [];
    var inputs = document.querySelectorAll('.gf-checkbox input:checked');
    inputs.forEach(inp => {
        moves.push(inp.value);
    });
    
    if(moves.length === 0) {
        alert("Bitte fülle erst den Gamefinder aus!");
        return;
    }
    
    // Create nodes inside the new layer
    var startX = 500;
    var startY = 500;
    
    var parentId = 'node_gf_base_' + Date.now();
    pbData.nodes[parentId] = {
        id: parentId,
        layer: rootNodeId, // nested inside the root node
        text: 'Mein Gameplan',
        x: startX,
        y: startY
    };
    
    for(let i=0; i<moves.length; i++) {
        let nId = 'node_gf_move_' + i + '_' + Date.now();
        pbData.nodes[nId] = {
            id: nId,
            layer: rootNodeId,
            text: moves[i].substring(0,25),
            x: startX + 200,
            y: startY + (i * 80) - ((moves.length * 80)/2)
        };
        
        // Connect parent to this move
        pbData.edges.push({
            source: parentId,
            target: nId,
            layer: rootNodeId
        });
    }
    
    pbSave();
    
    // Switch to playbook and open the layer
    if(typeof switchView === 'function') {
        switchView('view-playbook');
    }
    
    pbCurrentLayer = rootNodeId;
    pbLayerHistory = [{id: "root", name: "Root"}, {id: rootNodeId, name: "Gamefinder Profil"}];
    pbPanX = -500 + (pbCanvasWrapper.clientWidth/2);
    pbPanY = -500 + (pbCanvasWrapper.clientHeight/2);
    pbUpdateTransform();
    pbRender();
    
    alert("Erfolgreich ins Playbook exportiert!");
}

// --- UTILITIES & EXPORT ---
function pbSaveAndBack() {
    pbSave();
    if(typeof switchView === 'function') switchView('view-menu');
}

function pbHandleExport(type) {
    if (type === 'json') {
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pbData));
        let dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "grapp_playbook_backup.json");
        dlAnchorElem.click();
    } else if (type === 'import') {
        document.getElementById('pbImportFile').click();
    } else if (type === 'print') {
        if (typeof html2pdf === 'undefined') {
            let script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => doPdfExport();
            document.head.appendChild(script);
        } else {
            doPdfExport();
        }
    }
}

function pbHandleImportFile(e) {
    let file = e.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let imported = JSON.parse(e.target.result);
            if (imported.nodes && imported.edges) {
                pbData = imported;
                pbSave();
                pbCurrentLayer = 'root';
                pbLayerHistory = [{id: "root", name: "Root"}];
                pbRender();
                alert("Backup erfolgreich geladen!");
            } else {
                alert("Ungültige Playbook-Datei.");
            }
        } catch(err) {
            alert("Fehler beim Lesen der Datei.");
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
}

function doPdfExport() {
    pbCenterView(false); // Auto center and fit before exporting
    
    // We wait 100ms for CSS transitions/transforms to settle before capturing
    setTimeout(() => {
        let cw = pbCanvasWrapper.clientWidth;
        let ch = pbCanvasWrapper.clientHeight;
        
        // Lock dimensions to prevent flexbox collapse during html2canvas cloning
        pbCanvasWrapper.style.width = cw + 'px';
        pbCanvasWrapper.style.height = ch + 'px';
        
        var opt = {
          margin:       0,
          filename:     'grapp_playbook.pdf',
          image:        { type: 'jpeg', quality: 1.0 },
          html2canvas:  { 
              scale: 2, 
              backgroundColor: '#111111',
              width: cw,
              height: ch,
              scrollX: 0,
              scrollY: 0
          },
          jsPDF:        { unit: 'px', format: [cw, ch], orientation: cw > ch ? 'landscape' : 'portrait' }
        };
        
        html2pdf().set(opt).from(pbCanvasWrapper).save().then(() => {
            // Unlock dimensions after export
            pbCanvasWrapper.style.width = '';
            pbCanvasWrapper.style.height = '';
        });
    }, 100);
}
