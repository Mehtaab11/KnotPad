import pkg from 'mongoose'
const { model, Schema } = pkg

const DocumentSchema = new Schema({
    title: {
        type: String,
        default: 'Untitled Document',
    },
    content: {
        type: Object,
        default: '',
    },
}, {
    timestamps: true,
})

const Document = model('Document', DocumentSchema)

export default Document