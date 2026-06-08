import express from "express"
import {
    createDocument,
    updateDocument,
    deleteDocument,
    getAllDocument,
    getDocument
} from "../controllers/documentController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { addCollaborator } from "../controllers/documentController.js"

const router = express.Router()

router.use(authMiddleware)

router.post('/', createDocument)
router.get('/', getAllDocument)
router.get('/:id', getDocument)
router.put('/:id', updateDocument)
router.delete('/:id', deleteDocument)
router.post("/:id/collaborators", addCollaborator)

export default router