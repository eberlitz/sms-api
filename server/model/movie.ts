import mongoose = require('mongoose');

export interface IMovieSchema extends mongoose.Document {
}

const movieSchema = new mongoose.Schema({});

export const Movie = mongoose.model<IMovieSchema>('movies', movieSchema);
