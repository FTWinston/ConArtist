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
            style: '#f60',
        };
        case 3: return {
            name: 'Yellow',
            style: '#ee0',
        };
        case 4: return {
            name: 'Light Green',
            style: '#0d0',
        };
        case 5: return {
            name: 'Dark Green',
            style: '#083',
        };
        case 6: return {
            name: 'Light Blue',
            style: '#0ce',
        };
        case 7: return {
            name: 'Dark Blue',
            style: '#33f',
        };
        case 8: return {
            name: 'Violet',
            style: '#c0f',
        };
        default:
            console.error(`Unrecognised color ID: ${id}`);
            return {
                name: 'Unknown',
                style: '#999',
            };
    }
}