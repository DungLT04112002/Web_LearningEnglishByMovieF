const addQuiz = async (req, res) => {
    const { movie_id, passage } = req.body;

    try {
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

                // Thêm quiz mới
                const query = `
                    INSERT INTO quizzes (movie_id, passage)
                    VALUES (?, ?)
                `;

                connection.query(
                    query,
                    [movie_id, passage],
                    (error, results) => {
                        if (error) {
                            console.error('Error adding quiz:', error);
                            return res.status(500).json({
                                error: 'Error adding quiz',
                                details: error.message
                            });
                        }

                        res.status(201).json({
                            message: 'Quiz added successfully',
                            quizId: results.insertId
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in addQuiz:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};