const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favourites = require('../models/favourite');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
	res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyOrdinaryUser, (req, res, next) => {

	Favourites.find({'user': req.user._id})
	.populate('dishes')
	.populate('user')
	.then((favourites) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(favourites);
	}, (err) => next(err))
	.catch((err) => next(err));

})
.post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {

	Favourites.findOne({'user': req.user._id})
	.then((favourite) => {
		if(favourite === null && req.body !== null) {
		  console.log('Favourite created');
			var favourite = new Favourites({ user: req.user._id });
			var dishes = req.body;
			for (var i = (dishes.length - 1); i >= 0; i--) {
					favourite.dishes.push(dishes[i]._id);
			}

			favourite.save()
			.then((favourite) => {
				res.statusCode = 200;
		   	res.setHeader('Content-Type', 'application/json');
		   	res.json(favourite);
      }, (err) => next(err))
		}
		else if(favourite !== null && req.body !== null){
			var dishes = req.body;
			for (var i = (dishes.length - 1); i >= 0; i--) {
				if (favourite.dishes.indexOf(dishes[i]._id) === -1) {
					favourite.dishes.push(dishes[i]._id);
        }
      }

			favourite.save()
			.then((favourite) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favourite);
			}, (err) => next(err))
		}
	}, (err) => next(err))
	.catch((err) => next(err));

})
.put(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {

	res.statusCode = 403;
	res.end('PUT operation not supported on /favourites');

})
.delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {

	Favourites.remove({'user': req.user._id})
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));

});

favouriteRouter.route('/:favouriteDishId')
.options(cors.corsWithOptions, (req, res) => {
	res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyOrdinaryUser, (req, res, next) => {

	Favourites.findOne({user: req.user._id})
	.then((favourites) => {
		if(!favourites) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			return res.json({'exists': false, 'favourites': favourites});
		}
		else {
			if(favourites.dishes.indexOf(req.params.favouriteDishId) < 0) {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				return res.json({'exists': false, 'favourites': favourites});
			}
			else {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				return res.json({'exists': true, 'favourites': favourites});
			}
		}
	}, (err) => next(err))
  .catch((err) => next(err));

})
.post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {

	Favourites.findOne({'user': req.user._id})
	.then((favourite) => {
		if(favourite === null) {
				console.log('Favourite created');
			  var favourite = new Favourites({ user: req.user._id });
			  favourite.dishes.push(req.params.favouriteDishId);

				favourite.save()
				.then((favourite) => {
					res.statusCode = 200;
		    	res.setHeader('Content-Type', 'application/json');
		    	res.json(favourite);
        }, (err) => next(err))
		}
		else if(favourite !== null){
			var dish = req.params.favouriteDishId;
			if (favourite.dishes.indexOf(dish) === -1) {
				favourite.dishes.push(dish);
      }
			favourite.save()
			.then((favourite) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favourite);
			}, (err) => next(err))
		}
	}, (err) => next(err))
	.catch((err) => next(err));

})
.put(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {

  res.statusCode = 403;
	res.end('PUT operation not supported on /favourites/'+ req.params.favouriteDishId);

})
.delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
  if(favourite != null && favourite.dishes.id(req.params.favouriteDishId) != null) {
    if((favourite.dishes.id(req.params.favouriteDishId).user).equals(req.user._id)) {
      Favourites.findByIdAndRemove(req.params.favouriteDishId)
			.then((favourite) => {
				favourite.save()
				.then((favourite) => {
					Favourites.findById(favourite._id)
					.populate('user')
					.populate('dishes')
					.then((favourite) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favourite);
					})
				})
			}, (err) => next(err))
			.catch((err) => next(err));
    }
    else {
      err = new Error('You are not authorized to delete this favourite!');
      err.status = 404;
      return next(err);
    }
  }
  else if(favourite == null){
    err = new Error('Dish ' + req.params.favouriteDishId + ' not found');
    err.status = 404;
    return next(err);
  }
  else{
    err = new Error('Dish ' + req.params.favouriteDishId + ' not found');
    err.status = 404;
    return next(err);
  }

});

module.exports = favouriteRouter;
