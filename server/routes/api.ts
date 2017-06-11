import { Movie } from '../model/movie';
import express = require('express');
const router = express.Router();


class MoviesController {
    findAll(req: express.Request, res: express.Response, next: express.NextFunction) {
        const movie = Movie.find({}).then((movies) => {
            res.send(200, movies);
        }, (err) => {
            res.send(500, err);
        });
    }
    findById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id = req.params.id;
        console.log('Retrieving movie: ' + id);
        const movie = Movie.findById(id).then((movie) => {
            res.send(200, movie);
        }, (err) => {
            res.send(500, err);
        });
    }
    add(req: express.Request, res: express.Response, next: express.NextFunction) {
        const movie = req.body;
        console.log('Adding movie: ' + JSON.stringify(movie));
        new Movie(movie).save()
            .then((movie) => {
                res.send(200, movie);
            }, (err) => {
                console.log('Error adding movie: ' + err);
                res.send(500, err);
            });
    }
    update(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id = req.params.id;
        const movie = req.body;
        console.log('Updating movie: ' + id);
        Movie.findByIdAndUpdate(id, movie)
            .then((movie) => {
                res.send(200, movie);
            }, (err) => {
                console.log('Error updating movie: ' + err);
                res.send(500, err);
            });
    }
    delete(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id = req.params.id;
        console.log('Deleting movie: ' + id);
        Movie.findByIdAndRemove(id)
            .then((movie) => {
                res.send(200, movie);
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
