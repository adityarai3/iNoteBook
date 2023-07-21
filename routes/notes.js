const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

router.get('/', (req, res) => {

    res.json([])
})
// ROUTE 1: Get All the Notes using: GET "/api/auth/getuser". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Add a new Note using: POST "/api/auth/addnote". Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),], async (req, res) => {
        try {

            const { title, description, tag } = req.body;

            // If there are errors, return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()

            res.json(savedNote)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })
//ROUTE 3: Update Notes using: PUT "/api/auth/updatenote". Login required
router.put('/updatenode/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body
        //creating an object of newNote
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        //Finding the note for updation
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Note Not Found"); }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Authorized");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json(note)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})
//ROUTE 4: Deleting a Note using: DELETE "/api/auth/deletenote". Login required
router.delete('/deletenode/:id', fetchuser, async (req, res) => {
    try {
        //Finding the note for deletion
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Note Not Found"); }
        //Allow deletion only if user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Authorized");
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json("Note Deleted Successfully")
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})
module.exports = router