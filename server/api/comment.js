const router = require('express').Router()
const {Post, User, Comments} = require('../db/models')

router.post('/', async (req, res, next) =>{
    try{
        console.log('req.body', req.body)
        const post = await Post.findById(req.body.postId)
        console.log('req.body.postid', req.body.postId)
        console.log('req.body.userId: ', req.body.userId)
        const newComment = await Comments.create({
            content: req.body.comment,
            postId: req.body.postId,
            userId: req.body.userId
        })
        // post.addComment(newComment)
        res.json({message: 'Successfully made a comment', newComment})
    } catch(err){
        next(err)
    }
})

module.exports = router