interface ColorInfo {
    name: string;
    style: string;
}

export function getColorInfo(id: number) {
    switch (id) {
        case 1: return {
            name: 'Red',
            style: '#f00',
        };
        case 2: return {
            name: 'Orange',
            style: '#f00',
        };
        case 3: return {
            name: 'Yellow',
            style: '#f00',
        };
        case 4: return {
            name: 'Light Green',
            style: '#f00',
        };
        case 5: return {
            name: 'Dark Green',
            style: '#f00',
        };
        case 6: return {
            name: 'Light Blue',
            style: '#f00',
        };
        case 7: return {
            name: 'Dark Blue',
            style: '#f00',
        };
        case 8: return {
            name: 'Violet',
            style: '#f00',
        };
        default:
            console.error(`Unrecognised color ID: ${id}`);
            return {
                name: 'Unknown',
                style: '#999',
            };
    }
}