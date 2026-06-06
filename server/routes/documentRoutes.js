import express from "express"
import {
    createDocument,
    updateDocument,
    deleteDocument,
    getAllDocument,
    getDocument
} from "../controllers/documentController.js"

const router = express.Router()

router.post('/', createDocument)
router.get('/', getAllDocument)
router.get('/:id', getDocument)
router.put('/:id', updateDocument)
router.delete('/:id', deleteDocument)

export default router