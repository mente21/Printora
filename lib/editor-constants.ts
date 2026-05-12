import { ProductTemplate } from '@/types/editor';

// This acts as a mock database of products available in Printora Studio
export const PRODUCT_TEMPLATES: ProductTemplate[] = [
    {
        id: 'classic-tshirt',
        name: 'Classic Unisex T-Shirt',
        description: 'A comfortable, classic fit t-shirt.',
        category: 't-shirts',
        defaultViewId: 'front-side',
        defaultColorHex: '#ffffff',
        variants: [
            { id: 'white', colorHex: '#ffffff', colorName: 'White' },
            { id: 'black', colorHex: '#0f172a', colorName: 'Black' },
            { id: 'green', colorHex: '#16a34a', colorName: 'AMU Green' },
            { id: 'red', colorHex: '#ef4444', colorName: 'Red' },
            { id: 'yellow', colorHex: '#fcd34d', colorName: 'Yellow' }
        ],
        views: [
            {
                id: 'front-side',
                name: 'Front side',
                mockupUrl: '/images/products/tshirt/front.png',
                printAreas: [
                    {
                        id: 'front-center',
                        width: 240,
                        height: 280,
                        left: 130,
                        top: 120
                    }
                ]
            },
            {
                id: 'back-side',
                name: 'Back side',
                mockupUrl: '/images/products/tshirt/back.png',
                printAreas: [
                    {
                        id: 'back-center',
                        width: 210,
                        height: 255,
                        left: 145,
                        top: 148
                    }
                ]
            },
            {
                id: 'left-side',
                name: 'Left sleeve',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'left-sleeve',
                        width: 265,
                        height: 350,
                        left: 117,
                        top: 110
                    }
                ]
            },
            {
                id: 'right-side',
                name: 'Right sleeve',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'right-sleeve',
                        width: 265,
                        height: 365,
                        left: 117,
                        top: 110
                    }
                ]
            },
            {
                id: 'neck-label',
                name: 'Neck label inner',
                mockupUrl: '/images/products/tshirt/neck-label.png',
                printAreas: [
                    {
                        id: 'neck-label-area',
                        width: 168,
                        height: 148,
                        left: 166,
                        top: 186
                    }
                ]
            }
        ]
    },
    {
        id: 'premium-hoodie',
        name: 'Premium Pullover Hoodie',
        description: 'Cozy and warm pullover hoodie.',
        category: 'hoodies',
        defaultViewId: 'front',
        defaultColorHex: '#0f172a',
        variants: [
            { id: 'white', colorHex: '#ffffff', colorName: 'White' },
            { id: 'black', colorHex: '#0f172a', colorName: 'Black' },
            { id: 'grey', colorHex: '#94a3b8', colorName: 'Athletic Heather' },
            { id: 'green', colorHex: '#16a34a', colorName: 'Forest Green' },
            { id: 'navy', colorHex: '#1e3a5f', colorName: 'Navy' }
        ],
        views: [
            {
                id: 'front',
                name: 'Front',
                mockupUrl: '/images/products/hoodie/front.png',
                printAreas: [
                    {
                        id: 'front-center',
                        width: 210,
                        height: 155,
                        left: 146,
                        top: 150
                    }
                ]
            },
            {
                id: 'back',
                name: 'Back',
                mockupUrl: '/images/products/hoodie/back.png',
                printAreas: [
                    {
                        id: 'back-center',
                        width: 200,
                        height: 250,
                        left: 148,
                        top: 152
                    }
                ]
            },
            {
                id: 'left-hand',
                name: 'Left sleeve',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'left-sleeve',
                        width: 100,
                        height: 155,
                        left: 210,
                        top: 110
                    }
                ]
            },
            {
                id: 'right-hand',
                name: 'Right sleeve',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'right-sleeve',
                        width: 100,
                        height: 155,
                        left: 193,
                        top: 100
                    }
                ]
            }
        ]
    },
    {
        id: 'crewneck-sweater',
        name: 'Crewneck Sweater',
        description: 'Classic crewneck sweatshirt for all seasons.',
        category: 'sweaters',
        defaultViewId: 'front',
        defaultColorHex: '#ffffff',
        variants: [
            { id: 'white', colorHex: '#ffffff', colorName: 'White' },
            { id: 'black', colorHex: '#0f172a', colorName: 'Black' },
            { id: 'grey', colorHex: '#94a3b8', colorName: 'Grey Heather' },
            { id: 'green', colorHex: '#16a34a', colorName: 'Forest Green' },
            { id: 'burgundy', colorHex: '#7f1d1d', colorName: 'Burgundy' }
        ],
        views: [
            {
                id: 'front',
                name: 'Front',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'front-center',
                        width: 200,
                        height: 265,
                        left: 150,
                        top: 115
                    }
                ]
            },
            {
                id: 'back',
                name: 'Back',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'back-center',
                        width: 200,
                        height: 265,
                        left: 150,
                        top: 115
                    }
                ]
            },
            {
                id: 'left-side',
                name: 'Left sleeve',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'left-sleeve',
                        width: 100,
                        height: 155,
                        left: 200,
                        top: 100
                    }
                ]
            },
            {
                id: 'right-side',
                name: 'Right sleeve',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'right-sleeve',
                        width: 100,
                        height: 155,
                        left: 198,
                        top: 100
                    }
                ]
            }
        ]
    },
    {
        id: 'classic-cap',
        name: 'Classic Baseball Cap',
        description: 'Structured 6-panel cap with embroidery.',
        category: 'hats',
        defaultViewId: 'front',
        defaultColorHex: '#0f172a',
        variants: [
            { id: 'white', colorHex: '#ffffff', colorName: 'White' },
            { id: 'black', colorHex: '#0f172a', colorName: 'Black' },
            { id: 'green', colorHex: '#16a34a', colorName: 'Forest Green' },
            { id: 'red', colorHex: '#dc2626', colorName: 'Red' },
            { id: 'navy', colorHex: '#1e3a5f', colorName: 'Navy' },
            { id: 'beige', colorHex: '#d4b896', colorName: 'Beige' }
        ],
        views: [
            {
                id: 'front',
                name: 'Front',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'front-center',
                        width: 270,
                        height: 140,
                        left: 105,
                        top: 165
                    }
                ]
            }
        ]
    },
    {
        id: 'ceramic-mug',
        name: 'Ceramic Mug 11oz',
        description: 'Classic 11oz ceramic mug with full wrap print.',
        category: 'mugs',
        defaultViewId: 'wrap',
        defaultColorHex: '#ffffff',
        variants: [
            { id: 'white', colorHex: '#ffffff', colorName: 'White' },
            { id: 'black', colorHex: '#0f172a', colorName: 'Black' }
        ],
        views: [
            {
                id: 'wrap',
                name: 'Full Wrap',
                mockupUrl: '',
                printAreas: [
                    {
                        id: 'mug-wrap',
                        width: 1024,
                        height: 512,
                        left: 0,
                        top: 0
                    }
                ]
            }
        ]
    }
,
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
