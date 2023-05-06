import express from 'express';
import * as housesData from '../data/houses.js';
import * as reviewsData from '../data/reviews.js';
import xss from 'xss';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const reviewsList = await reviewsData.getAll();
        console.log("reviewsList", reviewsList);
        res.status(200).json(reviewsList);
    } catch (e) {
        console.error('Error during fetching all reviews:', e);
        res.status(500).json({ error: e });
    }
});
  

router.get('/:accommodationId', async (req, res) => {
    try {
      const accommodationId = req.params.accommodationId;
      const reviewsList = await reviewsData.getReviewsByAccommodationId(accommodationId);
      console.log("reviewsList", reviewsList);
      res.status(200).render('reviews/list', { reviewsList });
    } catch (e) {
      console.error('Error during fetching reviews:', e);
      res.status(400).render('reviews/message', { message: 'Reviews not found', error: e });
    }
});

router.post('/:accommodationId', async (req, res) => {
    try {
        const accommodationId = req.params.accommodationId;
        const userEmail = req.session.user.emailAddress;
        const reviewData = {
            rating: parseFloat(req.body.rating),
            review: req.body.review,
      };
        console.log("reviewData", reviewData);
  
        const newReview = await reviewsData.createReview(userEmail, accommodationId, reviewData);
        console.log("newReview", newReview);
        res.status(201).redirect(`/houses/${accommodationId}`);
    } catch (e) {
        console.error('Error during review creation:', e);
        res.status(400).render('reviews/message', { message: 'Review not created', error: e });
    }  
});
  
  
router.post('/:accommodationId/:reviewId/delete', async (req, res) => {
    if (!req.session.user) {
        return res.status(400).render("reviews/message", { message: "You need to login"});
    }
  
    const { accommodationId, reviewId } = req.params;
    const userEmail = req.session.user.emailAddress;
    
    console.log('Accommodation ID:', accommodationId);
    console.log('Review ID:', reviewId);
  
    try {
        await reviewsData.deleteReview(accommodationId, userEmail, reviewId);
        res.status(200).render('reviews/message', { message: 'Review deleted successfully' });
    } catch (e) {
        console.error('Error during review deletion:', e);
        res.status(400).render('reviews/message', { message: 'Review not deleted', error: e });
    }
});

export default router;
