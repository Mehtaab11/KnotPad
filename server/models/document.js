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
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }]
}, {
    timestamps: true,
})

const Document = model('Document', DocumentSchema)

export default Document