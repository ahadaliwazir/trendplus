const { Episode, Drama } = require('../models');

exports.getEpisodesByDrama = async (req, res) => {
    try {
        const { dramaId } = req.params;
        const episodes = await Episode.findAll({
            where: { drama_id: dramaId },
            order: [['episode_number', 'ASC']]
        });
        res.json(episodes);
    } catch (error) {
        console.error('Error fetching episodes:', error);
        res.status(500).json({ message: 'Error fetching episodes', error: error.message });
    }
};

exports.createEpisode = async (req, res) => {
    try {
        const { drama_id, episode_number, video_url, duration, thumbnail_url, release_date } = req.body;

        // Check if episode already exists
        const existing = await Episode.findOne({
            where: { drama_id, episode_number }
        });

        if (existing) {
            return res.status(400).json({ message: 'Episode number already exists for this drama' });
        }

        const episode = await Episode.create({
            drama_id,
            episode_number,
            video_url,
            duration,
            thumbnail_url,
            release_date
        });

        // Update total episodes count in Drama model
        const totalEpisodes = await Episode.count({ where: { drama_id } });
        await Drama.update({ episodes: totalEpisodes }, { where: { id: drama_id } });

        res.status(201).json(episode);
    } catch (error) {
        console.error('Error creating episode:', error);
        res.status(500).json({ message: 'Error creating episode', error: error.message });
    }
};

exports.updateEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const episode = await Episode.findByPk(id);
        if (!episode) {
            return res.status(404).json({ message: 'Episode not found' });
        }

        await episode.update(updateData);
        res.json(episode);
    } catch (error) {
        console.error('Error updating episode:', error);
        res.status(500).json({ message: 'Error updating episode', error: error.message });
    }
};

exports.deleteEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        const episode = await Episode.findByPk(id);

        if (!episode) {
            return res.status(404).json({ message: 'Episode not found' });
        }

        const dramaId = episode.drama_id;
        await episode.destroy();

        // Update total episodes count in Drama model
        const totalEpisodes = await Episode.count({ where: { drama_id: dramaId } });
        await Drama.update({ episodes: totalEpisodes }, { where: { id: dramaId } });

        res.json({ message: 'Episode deleted successfully' });
    } catch (error) {
        console.error('Error deleting episode:', error);
        res.status(500).json({ message: 'Error deleting episode', error: error.message });
    }
};
