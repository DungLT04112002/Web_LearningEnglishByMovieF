const connection = require('../../config/database');

// Thêm phụ đề cho phim
const fs = require('fs').promises;

const addSubtitle = async (req, res) => {
    console.log("req.file", req.file);
    console.log("req.body", req.body);

    const { movie_id, language } = req.body;
    let srt_content = '';

    try {
        // Nếu có file thì đọc nội dung
        if (req.file) {
            srt_content = await fs.readFile(req.file.path, 'utf8');
        } else {
            return res.status(400).json({ error: 'Subtitle file is required' });
        }

        console.log("movie_id", movie_id);
        console.log("language", language);
        console.log("subtitleFile", srt_content.substring(0, 100) + '...'); // In 100 ký tự đầu

        // Kiểm tra xem phim có tồn tại không
        connection.query(
            'SELECT id FROM movies WHERE id = ?',
            [movie_id],
            (error, movieResults) => {
                if (error) {
                    console.error('Error checking movie:', error);
                    return res.status(500).json({
                        error: 'Error checking movie',
                        details: error.message
                    });
                }

                if (movieResults.length === 0) {
                    return res.status(404).json({ message: 'Movie not found' });
                }

                // Thêm phụ đề mới
                const query = `
                    INSERT INTO subtitles (movie_id, language, srt_content)
                    VALUES (?, ?, ?)
                `;

                connection.query(
                    query,
                    [movie_id, language, srt_content],
                    (error, results) => {
                        if (error) {
                            console.error('Error adding subtitle:', error);
                            return res.status(500).json({
                                error: 'Error adding subtitle',
                                details: error.message
                            });
                        }

                        res.status(201).json({
                            message: 'Subtitle added successfully',
                            subtitleId: results.insertId
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in addSubtitle:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};


// Lấy phụ đề của một phim
const getMovieSubtitles = async (req, res) => {
    const { movie_id } = req.params;

    try {
        const query = `
            SELECT s.*, m.title as movie_title 
            FROM subtitles s
            JOIN movies m ON s.movie_id = m.id
            WHERE s.movie_id = ?
        `;

        connection.query(query, [movie_id], (error, results) => {
            if (error) {
                console.error('Error fetching subtitles:', error);
                return res.status(500).json({
                    error: 'Error fetching subtitles',
                    details: error.message
                });
            }

            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error in getMovieSubtitles:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};
//Lấy phụ đề toàn bộ subtitle
const getAllSubtitles = async (req, res) => {
    const query = 'SELECT * FROM subtitles';
    connection.query(query, (error, results) => {
        res.status(200).json(results);
    });
};
// Cập nhật phụ đề
const updateSubtitle = async (req, res) => {
    const { id } = req.params;
    const { language, srt_content } = req.body;

    try {
        const query = `
            UPDATE subtitles 
            SET language = ?, srt_content = ?
            WHERE id = ?
        `;

        connection.query(
            query,
            [language, srt_content, id],
            (error, results) => {
                if (error) {
                    console.error('Error updating subtitle:', error);
                    return res.status(500).json({
                        error: 'Error updating subtitle',
                        details: error.message
                    });
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Subtitle not found' });
                }

                res.status(200).json({ message: 'Subtitle updated successfully' });
            }
        );
    } catch (error) {
        console.error('Error in updateSubtitle:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Xóa phụ đề
const deleteSubtitle = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM subtitles WHERE id = ?';

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error deleting subtitle:', error);
                return res.status(500).json({
                    error: 'Error deleting subtitle',
                    details: error.message
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Subtitle not found' });
            }

            res.status(200).json({ message: 'Subtitle deleted successfully' });
        });
    } catch (error) {
        console.error('Error in deleteSubtitle:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Lấy phụ đề theo ngôn ngữ cụ thể
const getSubtitleByLanguage = async (req, res) => {
    const { movie_id, language } = req.params;

    try {
        const query = `
            SELECT * FROM subtitles 
            WHERE movie_id = ? AND language = ?
        `;

        connection.query(query, [movie_id, language], (error, results) => {
            if (error) {
                console.error('Error fetching subtitle:', error);
                return res.status(500).json({
                    error: 'Error fetching subtitle',
                    details: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: `No subtitle found for language: ${language}`
                });
            }

            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error in getSubtitleByLanguage:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = {
    // ... các export trước đó ...
    getAllSubtitles,
    addSubtitle,
    getMovieSubtitles,
    updateSubtitle,
    deleteSubtitle,
    getSubtitleByLanguage
};