const axios = require('axios');

async function verifyData() {
    try {
        console.log('Fetching Mann Mayal...');
        const response = await axios.get('http://localhost:8080/api/dramas?search=Mann+Mayal');
        const drama = response.data.data.dramas[0];

        if (!drama) {
            console.log('Drama not found.');
            return;
        }

        console.log('Drama Data:', JSON.stringify(drama, null, 2));

        console.log('Fetching Channels...');
        const channelsResponse = await axios.get('http://localhost:8080/api/dramas/channels');
        const channels = channelsResponse.data.data.channels;
        console.log('Channels count:', channels.length);
        console.log('Channels:', JSON.stringify(channels, null, 2));

        if (drama.channel) {
            const match = channels.find(c => c.id === drama.channel.id);
            console.log('Match found in channels list:', match);
        } else {
            console.log('Drama has no channel object.');
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

verifyData();
