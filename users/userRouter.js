const router = require('express').Router();
const User = require('./userDb.js');
const Post = require('../posts/postDb');

router.post('/', validateUser, async (req, res) => {
	const name = req.body;
	User.insert(name)
		.then(data => {
			User.getById(data.id).then(data => {
				res.status(201).json(data);
			});
		})
		.catch(error => {
			res.status(500).json({ message: 'Unable to add user to the database' });
		});
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
	const id = req.params.id;
	const postData = req.body;

	Post.insert({ text: postData.text, user_id: id })
		.then(data => {
			res.status(201).json(data);
		})
		.catch(error => {
			res.status(500).json({ message: 'Unable to add post.' });
		});
});

router.get('/', (req, res) => {
	User.get()
		.then(data => {
			res.status(200).json(data);
		})
		.catch(error => {
			res.status(500).json({ message: 'Unable to retrieve users.' });
		});
});

router.get('/:id', validateUserId, async (req, res) => {
	const id = req.params.id;
	User.getById(id)
		.then(data => {
			res.status(200).json(data);
		})
		.catch(error => {
			res
				.status(500)
				.json({ message: `Unable to retrieve user with id ${id}` });
		});
});

router.get('/:id/posts', validateUserId, async (req, res) => {
	const id = req.params.id;
	User.getUserPosts(id)
		.then(data => {
			res.status(200).json(data);
		})
		.catch(error => {
			res
				.status(500)
				.json({ message: 'Unable to retrieve posts for this user.' });
		});
});

router.delete('/:id', validateUserId, async (req, res) => {
	const id = req.params.id;

	User.remove(id)
		.then(data => {
			res.status(200).json({
				message: `User with id of ${id} has been successfully deleted!`
			});
		})
		.catch(error => {
			res.status(500).json({
				message: 'Unable to delete the user.'
			});
		});
});

router.put('/:id', validateUserId, validateUser, async (req, res) => {
	const id = req.params.id;
	const name = req.body;

	User.update(id, name)
		.then(data => {
			User.getById(id).then(data => {
				res.status(201).json(data);
			});
		})
		.catch(error => {
			res.status(500).json({ message: 'Unable to update user.' });
		});
});

//custom middleware

async function validateUserId(req, res, next) {
	const id = req.params.id;

	const user = await User.getById(id);

	if (user) {
		req.user = user;
		next();
	} else {
		res.status(400).json({ message: 'Invalid user ID' });
	}
}

function validateUser(req, res, next) {
	if (Object.keys(req.body) == 0) {
		res.status(400).json({ message: 'Missing user data' });
	} else if (req.body.name) {
		next();
	} else {
		res.status(400).json({ message: 'Missing required name field' });
	}
}

function validatePost(req, res, next) {
	if (Object.keys(req.body) == 0) {
		res.status(400).json({ message: 'Missing post data' });
	} else if (req.body.text) {
		next();
	} else {
		res.status(400).json({ message: 'Missing required text field' });
	}
}

module.exports = router;
