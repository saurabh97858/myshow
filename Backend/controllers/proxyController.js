import axios from 'axios';

export const proxyImage = async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ success: false, message: 'URL is required' });
        }

        const response = await axios.get(url, {
            responseType: 'arraybuffer' // Important for images
        });

        const contentType = response.headers['content-type'] || 'image/jpeg';

        res.set('Content-Type', contentType);
        res.set('Access-Control-Allow-Origin', '*'); // Enable CORS
        res.set('Cache-Control', 'public, max-age=31536000'); // Cache for performance

        res.send(response.data);

    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch image' });
    }
};
