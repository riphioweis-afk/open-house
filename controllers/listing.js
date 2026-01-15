const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const formatterCurrency = require("../utils/formatCurrency");

// I.N.D.U.C.E.S
// INDEX GET /listings/
router.get("/", async (req, res) => {
  const listings = await Listing.find().populate("owner");

  console.log(listings);
  res.render("listings/index.ejs", { listings });
});

// NEW GET /listings/new
router.get("/new", (req, res) => {
  res.render("listings/new.ejs", { data: {} });
});

// Delete DELETE /listings/:listingId
router.delete("/:listingId", async (req, res) => {
  try {
    // await Listing.findByIdAndDelete(req.params.listingId)
    const foundListing = await Listing.findById(req.params.listingId);
    if (!foundListing.owner._id.equals(req.session.user._id)) {
      throw new Error("You must own this property to delete it");
    }

    await foundListing.deleteOne();

    res.redirect("/listings");
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect(`/listings/${req.params.listingId}`);
    });
  }
});

// UPDATE PUT /listings/:listingId
router.put("/:listingId", async (req, res) => {
  try {
    const foundListing = await Listing.findById(req.params.listingId);
    if (!foundListing.owner._id.equals(req.session.user._id)) {
      throw new Error("You must own this property to update it");
    }

    await foundListing.updateOne(req.body);

    res.redirect("/listings");
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});

//CREATE POST /listings
router.post("/", async (req, res) => {
  try {
    const { city, streetAddress, price, size } = req.body;

    if (!city.trim()) throw new Error("City requires a proper City");
    if (!streetAddress.trim())
      throw new Error("Please provide a proper Address");
    if (size < 0 || size === "")
      throw new Error("Invalid size, please provide a size greater than 0");
    if (price < 0 || price === "")
      throw new Error("Invalid price, please provide a price greater than $0");

    req.body.owner = req.session.user._id;
    await Listing.create(req.body);
    res.redirect("/listings");
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings/new");
    });
  }
});

// Seed Route (load some sample data)
router.get("/seed", async (req, res) => {
  await Listing.deleteMany({});
  // await Listing.create([
  //   {
  //     streetAddress: "12211 Whatever St., LA, CA, 90000",
  //     price: 10000000,
  //     size: 1600,
  //     city: "Los Angeles",
  //   },
  //   {
  //     streetAddress: "1000 Some St., LA, CA, 90000",
  //     price: 500000,
  //     size: 1600,
  //     city: "West Hills",
  //   },
  //   {
  //     streetAddress: "3414 Whatever St., LA, CA, 90000",
  //     price: 200,
  //     size: 1600000,
  //     city: "Inglewood",
  //   },
  // ]);

  res.redirect("/listings");
});

// EDIT GET /listings/:listingId/edit
router.get("/:listingId/edit", async (req, res) => {
  try {
    const foundListing = await Listing.findById(req.params.listingId);
    console.log(req.params);
    if (!foundListing)
      throw new Error(
        `Failed to find a property with id ${req.params.listingId}`
      );
    res.render("listings/edit.ejs", { listing: foundListing });
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});

// SHOW GET /listings/:listingId
router.get("/:listingId", async (req, res) => {
  try {
    const foundListing = await Listing.findById(req.params.listingId).populate(
      "owner"
    );

    const userHasLikedItem = foundListing.favoritedByUsers.some(user => {
      return user.equals(req.session.user._id)
    })

    const currency = formatterCurrency(foundListing.price, 'USD')

    foundListing.price = currency

    console.log(currency, '$$$$$$$$$$$$$$');

    if (!foundListing)
      throw new Error(
        `Failed to find a property with id ${req.params.listingId}`
      );
    res.render("listings/show.ejs", { listing: {
      price: currency,
      _id: foundListing._id,
      size: foundListing.size,
      streetAddress: foundListing.streetAddress,
      city: foundListing.city,
      owner: foundListing.owner,
      favoritedByUsers: foundListing.favoritedByUsers
    }, userHasLikedItem});
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});

router.post("/:listingId/favorited-by/:userId", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $push: { favoritedByUsers: req.params.userId }
    })

    res.redirect(`/listings/${req.params.listingId}`)

  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});


router.delete("/:listingId/favorited-by/:userId", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $pull: { favoritedByUsers: req.params.userId }
    })

    res.redirect(`/listings/${req.params.listingId}`)

  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});

module.exports = router;