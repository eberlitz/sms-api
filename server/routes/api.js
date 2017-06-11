"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const movie_1 = require("../model/movie");
const express = require("express");
const router = express.Router();
class MoviesController {
    findAll(req, res, next) {
        const movie = movie_1.Movie.find({}).then((movies) => {
            res.json(movies);
        }, (err) => {
            res.send(500, err);
        });
    }
    findById(req, res, next) {
        const id = req.params.id;
        console.log('Retrieving movie: ' + id);
        const movie = movie_1.Movie.findById(id).then((movie) => {
            res.json(movie);
        }, (err) => {
            res.send(500, err);
        });
    }
    add(req, res, next) {
        const movie = req.body;
        console.log('Adding movie: ' + JSON.stringify(movie));
        new movie_1.Movie(movie).save()
            .then((movie) => {
            res.json(movie);
        }, (err) => {
            console.log('Error adding movie: ' + err);
            res.send(500, err);
        });
    }
    update(req, res, next) {
        const id = req.params.id;
        const movie = req.body;
        console.log('Updating movie: ' + id);
        movie_1.Movie.findByIdAndUpdate(id, movie)
            .then((movie) => {
            res.json(movie);
        }, (err) => {
            console.log('Error updating movie: ' + err);
            res.send(500, err);
        });
    }
    delete(req, res, next) {
        const id = req.params.id;
        console.log('Deleting movie: ' + id);
        movie_1.Movie.findByIdAndRemove(id)
            .then((movie) => {
            res.json(movie);
        }, (err) => {
            console.log('Error removing movie: ' + err);
            res.send(500, err);
        });
    }
}
const movieController = new MoviesController();
router.get('/movies', movieController.findAll);
router.get('/movies/:id', movieController.findById);
router.post('/movies', movieController.add);
router.put('/movies/:id', movieController.update);
router.delete('/movies/:id', movieController.delete);
module.exports = router;
//# sourceMappingURL=api.js.map