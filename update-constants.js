const fs = require('fs');
let data = fs.readFileSync('lib/editor-constants.ts', 'utf8');
data = data.substring(0, data.lastIndexOf(']'));
data += `,
    {
        id: 'banner',
        name: 'Custom Banner',
        description: 'Print-ready banner — set any size, ratio, and DPI.',
        category: 'banners',
        defaultViewId: 'banner-area',
        defaultColorHex: '#ffffff',
        variants: [{ id: 'white', colorHex: '#ffffff', colorName: 'White' }],
        views: [{ id: 'banner-area', name: 'Banner Area', mockupUrl: '', printAreas: [{ id: 'banner-print', width: 1000, height: 500, left: 0, top: 0 }]}]
    }
];
`;
fs.writeFileSync('lib/editor-constants.ts', data);
