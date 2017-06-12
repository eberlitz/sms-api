import { Movie } from '../model/movie';
import express = require('express');
import crypto = require('crypto');
const router = express.Router();

import azure = require('azure-storage');

const QUEUE_NAME = 'myqueue';

const queueSvc = azure.createQueueService();
function createQueueIfNotExists() {
    return new Promise((resolve, reject) => {
        queueSvc.createQueueIfNotExists(QUEUE_NAME, function (error, result, response) {
            if (!error) {
                resolve();
            } else {
                reject(error);
            }
        });
    });
}

async function createMessage(message: string) {
    await createQueueIfNotExists();
    return new Promise((resolve, reject) => {
        queueSvc.createMessage(QUEUE_NAME, message, function (error, result, response) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

async function getMessage() {
    await createQueueIfNotExists();
    return new Promise<azure.QueueService.QueueMessageResult>((resolve, reject) => {
        queueSvc.getMessages(QUEUE_NAME, function (error, result, response) {
            if (error) {
                reject(error);
            } else {
                resolve(result[0]);
            }
        });
    });
}


async function deleteMsg(message: azure.QueueService.QueueMessageResult) {
    return new Promise((resolve, reject) => {
        queueSvc.deleteMessage(
            QUEUE_NAME,
            message.messageId,
            message.popReceipt,
            function (error, response) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
    });
}



const handles = {};
async function addToQueue(fn: () => Promise<any>) {
    const buf = crypto.randomBytes(16);
    const handleId = buf.toString('hex');
    await createMessage(handleId);
    handles[handleId] = fn;
}

(function process() {
    setTimeout(async function () {
        try {
            const msg = await getMessage();
            if (msg && msg.messageText && handles[msg.messageText]) {
                await handles[msg.messageText]();
                await deleteMsg(msg);
            }
        } catch (err) {
            console.log(err);
        }
        process();
    }, 100);
})();


class MoviesController {
    findAll(req: express.Request, res: express.Response, next: express.NextFunction) {
        addToQueue(() => {
            return Movie.aggregate([{ $limit: 100 }]).then((movies) => {
                res.json(movies);
            }, (err) => {
                res.send(500, err);
            });
        });
    }
    findById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id = req.params.id;
        console.log('Retrieving movie: ' + id);
        addToQueue(() => {
            // return Movie.findById(id).then((movie) => {

            return new Promise((resolve) => {
                setTimeout(function () {
                    res.json({
                        abra: 'cadabra'
                    });
                    resolve();
                }, 1800);
            });
            // }, (err) => {
            // res.send(500, err);
            // });
        });
    }
    add(req: express.Request, res: express.Response, next: express.NextFunction) {
        const movie = req.body;
        console.log('Adding movie: ' + JSON.stringify(movie));
        addToQueue(() => {
            return new Movie(movie).save()
                .then((movie) => {
                    res.json(movie);
                }, (err) => {
                    console.log('Error adding movie: ' + err);
                    res.send(500, err);
                });
        });
    }
    update(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id = req.params.id;
        const movie = req.body;
        console.log('Updating movie: ' + id);
        addToQueue(() => {
            return Movie.findByIdAndUpdate(id, movie)
                .then((movie) => {
                    res.json(movie);
                }, (err) => {
                    console.log('Error updating movie: ' + err);
                    res.send(500, err);
                });
        });
    }
    delete(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id = req.params.id;
        console.log('Deleting movie: ' + id);
        addToQueue(() => {
            return Movie.findByIdAndRemove(id)
                .then((movie) => {
                    res.json(movie);
                }, (err) => {
                    console.log('Error removing movie: ' + err);
                    res.send(500, err);
                });
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
