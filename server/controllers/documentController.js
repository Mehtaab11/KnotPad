import Document from "../models/document.js";
import User from "../models/user.js";

export const createDocument = async (req, res) => {

    const { title } = req.body
    const userId = req.userId

    try {
        const document = await Document.create({
            owner: userId,
            title
        })
        res.status(201).json(document)
    } catch (error) {
        res.status(500).json({
            message: "Failed to create Document",
            error: error.message
        })
    }
}

export const getDocument = async (req, res) => {
    const id = req.params.id
    const userId = req.userId
    // console.log(id, "test")
    try {
        // this check make sure that you can access the document even if u are a collaborator
        // or an owner
        const accessFilter = {
            $or: [{ owner: userId }, { collaborators: userId }]
        }
        const document = await Document.findOne({ _id: id, ...accessFilter })

        if (!document) return res.status(404).json({ message: 'Document Not found' })

        return res.status(200).json(document)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching document', error: error.message });
    }
}

export const getAllDocument = async (req, res) => {
    const userId = req.userId

    try {

        // this check make sure that you can access the document even if u are a collaborator
        // or an owner
        const accessFilter = {
            $or: [{ owner: userId }, { collaborators: userId }]
        }

        const documents = await Document.find(accessFilter).sort({
            updatedAt: -1
        })

        res.status(200).json(documents)
    } catch (error) {
        res.status(500).json({
            message: "Failed to get Document",
            error: error.message
        })
    }
}

export const updateDocument = async (req, res) => {
    const userId = req.userId

    try {
        const { title, content } = req.body

        const accessFilter = {
            $or: [{ owner: userId }, { collaborators: userId }]
        }

        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, ...accessFilter },
            { title, content },
            { new: true } // this line makes sure the updated document is also returned not only updated
        )

        if (!document) return res.status(404).json({ message: 'Document Not found' })

        return res.status(200).json(document)
    } catch (error) {

        res.status(500).json({
            message: "Failed to update Document",

            error: error.message

        })
    }
}


export const deleteDocument = async (req, res) => {
    const userId = req.userId
    const docId = req.params.id

    try {

        const document = await Document.findOne({
            _id: docId,
            $or: [{ owner: userId }, { collaborators: userId }]
        })

        if (!document) return res.status(404).json({ message: 'Document Not found' })

        if (document.owner.toString() === userId) {
            await Document.findByIdAndDelete(docId)
            return res.status(200).json({ message: "Document Deleted Successfully" })
        } else {
            await Document.findByIdAndUpdate(docId, {
                $pull: { collaborators: userId }
            })
            return res.status(200).json({ message: "Collaborator removed successfully" })
        }

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete Document",
            error: error.message
        })
    }

}

export const addCollaborator = async (req, res) => {
    try {
        const userId = req.userId
        const { email } = req.body
        const docId = req.params.id

        console.log(docId, "test")
        // const document = Document.findById({ _id: docId })

        const document = await Document.findById({ _id: docId })

        // console.log(document, "test")

        if (!document) return res.status(404).json({ message: 'Document Not found' })

        if (document.owner.toString() !== userId) {
            return res.status(403).json({ message: 'Only the owner can add collaborators' });
        }

        // console.log(document.owner.toString(), "testtttt")

        const guest = await User.findOne({
            email: email.toLowerCase()
        })

        if (!guest) {
            return res.status(403).json({ message: 'This user doesnt exists' });
        }

        // console.log(guest._id.toString())
        // console.log(document)
        if (guest._id.toString() === document.owner.toString()) {
            return res.status(403).json({ message: 'Owner itself can\'t be added in the collaborators list' });
        }

        // console.log(guest._id, "guest")

        if (document.collaborators?.some((id) => id.equals(guest._id))) {
            return res.status(403).json({ message: 'User has already been added to' });
        }

        const updatedDocument = await Document.findByIdAndUpdate({ _id: docId }, { $addToSet: { collaborators: guest._id } }, {
            new: true
        })


        res.status(200).json({ message: 'Collaborator added successfully', updatedDocument });
    } catch (error) {

        res.status(500).json({
            message: "Failed to add collaborators",
            error: error.message
        })
    }
}