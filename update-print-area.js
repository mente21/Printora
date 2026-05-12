const fs = require('fs');
let code = fs.readFileSync('components/editor/EditorUI.tsx', 'utf8');

const regex = /const printArea = selectedView\.printAreas\[0\];/g;
code = code.replace(regex, `const printArea = selectedProduct.id === 'banner' ? { id: 'banner-print', width: Math.max(500, bannerRealW), height: Math.max(500, bannerRealH), left: 0, top: 0 } : selectedView.printAreas[0];`);

fs.writeFileSync('components/editor/EditorUI.tsx', code);
console.log("Patched printArea dynamically.");
