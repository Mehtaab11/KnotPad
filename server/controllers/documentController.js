import Document from "../models/document.js";

export const createDocument = async (req, res) => {

    const { title } = req.body

    try {
        const document = await Document.create({
            title: req.body.title
        })
        res.status(201).json(document)
    } catch (error) {
        res.status(500).json({
            message: "Failed to create Document",
            error: error.msg
        })
    }
}

export const getDocument = async (req, res) => {
    const id = req.params.id
    console.log(id, "test")
    try {

        const document = await Document.findById(id)

        if (!document) return res.status(404).json({ message: 'Document Not found' })

        return res.status(200).json(document)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching document', error: error.message });
    }
}



export const getAllDocument = async (req, res) => {
    try {
        const documents = await Document.find().sort({
            updatedAt: -1
        })
        res.status(200).json(documents)
    } catch (error) {
        res.status(500).json({
            message: "Failed to get Document",
            error: error.msg
        })
    }
}

export const updateDocument = async (req, res) => {
    try {
        const { title, content } = req.body

        const document = await Document.findByIdAndUpdate(req.params.id, {
            title, content
        },
            { new: true } // this line makes sure the updated document is also returned not only updated
        )

        if (!document) return res.status(404).json({ message: 'Document Not found' })

        return res.status(200).json(document)
    } catch (error) {

        res.status(500).json({
            message: "Failed to update Document",
            error: error.msg
        })
    }
}

export const deleteDocument = async (req, res) => {

    try {

        const document = await Document.findByIdAndDelete(req.params.id)

        if (!document) return res.status(404).json({ message: 'Document Not found' })

        return res.status(200).json({ message: "Document Deleted Successfully" })


    } catch (error) {

        res.status(500).json({
            message: "Failed to update Document",
            error: error.msg
        })
    }

}