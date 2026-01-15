const express = require('express')
const router = express.Router({mergeParams: true})
const Listing = require('../models/listing')


// SHOW GET /user/profile
router.get('/profile', async (req, res) => {
    try {
        const myListings = await Listing.find({
            owner: req.session.user._id
        }).populate('owner')
        const myFavorites = await Listing.find({
            favoriteByUsers: req.session.user._id,
        }).populate('owner')
        res.render("user/show.ejs", {
            myListings,
            myFavorites
        })

    } catch (error) {
        req.session.message = error.message
        req.session.save(()=>{
            res.redirect('/')
        })
    }
})



module.exports = router