import express from 'express';
import {
  getAllDetails,
  createDetail,
  updateDetail,
  deleteDetail,
  getDetailsBySaleId,
} from '../controllers/detailsController.js';

const router = express.Router();

router.get('/', getAllDetails);
router.get('/sale/:saleId', getDetailsBySaleId);
router.post('/', createDetail);
router.put('/:id', updateDetail);
router.delete('/:id', deleteDetail);

export default router;
