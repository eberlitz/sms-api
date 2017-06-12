"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const movie_1 = require("../model/movie");
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const azure = require("azure-storage");
const QUEUE_NAME = 'myqueue';
const queueSvc = azure.createQueueService();
function createQueueIfNotExists() {
    return new Promise((resolve, reject) => {
        queueSvc.createQueueIfNotExists(QUEUE_NAME, function (error, result, response) {
            if (!error) {
                resolve();
            }
            else {
                reject(error);
            }
        });
    });
}
function createMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield createQueueIfNotExists();
        return new Promise((resolve, reject) => {
            queueSvc.createMessage(QUEUE_NAME, message, function (error, result, response) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    });
}
function getMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        yield createQueueIfNotExists();
        return new Promise((resolve, reject) => {
            queueSvc.getMessages(QUEUE_NAME, function (error, result, response) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result[0]);
                }
            });
        });
    });
}
function deleteMsg(message) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            queueSvc.deleteMessage(QUEUE_NAME, message.messageId, message.popReceipt, function (error, response) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    });
}
const handles = {};
function addToQueue(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        const buf = crypto.randomBytes(16);
        const handleId = buf.toString('hex');
        yield createMessage(handleId);
        handles[handleId] = fn;
    });
}
(function process() {
    setTimeout(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const msg = yield getMessage();
                if (msg && msg.messageText && handles[msg.messageText]) {
                    yield handles[msg.messageText]();
                    yield deleteMsg(msg);
                }
            }
            catch (err) {
                console.log(err);
            }
            process();
        });
    }, 1000);
})();
class MoviesController {
    findAll(req, res, next) {
        addToQueue(() => {
            return movie_1.Movie.aggregate([{ $limit: 100 }]).then((movies) => {
                res.json(movies);
            }, (err) => {
                res.send(500, err);
            });
        });
    }
    findById(req, res, next) {
        const id = req.params.id;
        console.log('Retrieving movie: ' + id);
        addToQueue(() => {
            return movie_1.Movie.findById(id).then((movie) => {
                res.json(movie);
            }, (err) => {
                res.send(500, err);
            });
        });
    }
    add(req, res, next) {
        const movie = req.body;
        console.log('Adding movie: ' + JSON.stringify(movie));
        addToQueue(() => {
            return new movie_1.Movie(movie).save()
                .then((movie) => {
                res.json(movie);
            }, (err) => {
                console.log('Error adding movie: ' + err);
                res.send(500, err);
            });
        });
    }
    update(req, res, next) {
        const id = req.params.id;
        const movie = req.body;
        console.log('Updating movie: ' + id);
        addToQueue(() => {
            return movie_1.Movie.findByIdAndUpdate(id, movie)
                .then((movie) => {
                res.json(movie);
            }, (err) => {
                console.log('Error updating movie: ' + err);
                res.send(500, err);
            });
        });
    }
    delete(req, res, next) {
        const id = req.params.id;
        console.log('Deleting movie: ' + id);
        addToQueue(() => {
            return movie_1.Movie.findByIdAndRemove(id)
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
//# sourceMappingURL=api.js.map