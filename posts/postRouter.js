const router = require('express').Router();
const Post = require('./postDb');

router.get('/', (req, res) => {
	Post.get()
		.then(data => {
			res.status(200).json(data);
		})
		.catch(error => {
			res.status(500).json({ message: 'Unable to retrieve posts' });
		});
});

router.get('/:id', validatePostId, async (req, res) => {
	const id = req.params.id;

	Post.getById(id)
		.then(data => {
			res.status(200).json(data);
		})
		.catch(error => {
			res
				.status(500)
				.json({ message: `Unable to retrieve post with id ${id}` });
		});
});

router.delete('/:id', validatePostId, async (req, res) => {
	const id = req.params.id;

	Post.remove(id)
		.then(data => {
			res
				.status(200)
				.json({ message: `Post with id ${id} has been successfully deleted!` });
		})
		.catch(error => {
			res.status(500).json({ message: 'Unable to delete post.' });
		});
});

router.put('/:id', validatePostId, validatePost, async (req, res) => {
	const id = req.params.id;
  const postData = req.body;
  
	Post.update(id, postData)
		.then(data => {
			Post.getById(id).then(data => {
				res.status(200).json(data);
			});
		})
		.catch(error => {
			res.status(500).json({ message: 'Unable to update post.' });
		});
});

// custom middleware

async function validatePostId(req, res, next) {
	const id = req.params.id;

	const post = await Post.getById(id);

	if (post) {
		req.post = post;
		next();
	} else {
		res.status(400).json({ message: 'Invalid post ID' });
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
