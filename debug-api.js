
const fetch = require('node-fetch');

const API_BASE_URL = 'https://ipo-management-backend.vercel.app';

async function run() {
    try {
        const listRes = await fetch(`${API_BASE_URL}/api/v1/mainboards`);
        const listData = await listRes.json();
        console.log('List data sample:', listData.data ? listData.data[0] : listData[0]);

        if (listData.data && listData.data.length > 0) {
            const id = listData.data[0]._id || listData.data[0].id;
            console.log('Fetching detail for ID:', id);
            const detailRes = await fetch(`${API_BASE_URL}/api/v1/mainboard/${id}`);
            const detailData = await detailRes.json();
            console.log('Detail data:', JSON.stringify(detailData, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

run();
