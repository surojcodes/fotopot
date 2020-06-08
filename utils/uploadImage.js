const mongoose = require('mongoose');
const ErrorResponse = require('./ErrorResponse');
const path = require('path');

const uploadImage =
    async (model, req, res, next, upload_path, limit) => {
        let resource = await model.findById(req.params.id);
        if (!resource) {
            return next(new ErrorResponse(`Resource with id ${req.params.id} not found.`, 404));
        }
        // check if image is uploaded
        if (!req.files)
            return next(new ErrorResponse(`Please upload an image to the post.`, 400));

        const file = req.files.files;
        // check the mime type of file uploaded
        if (!file.mimetype.startsWith('image'))
            return next(new ErrorResponse(`Please upload an 'image' file.`, 400));

        // check the file size
        if (file.size > limit)
            return next(new ErrorResponse(`File size exceeds its limit of ${limit}.`, 400));

        // create custom name for file
        const nameToStore = `upload-${resource._id}${path.parse(file.name).ext}`

        //store it 
        file.mv(`${upload_path}/${nameToStore}`, async err => {
            if (err) {
                return next(new ErrorResponse(`Internal Server Error in image uploading`, 500));
            }
            // store imageName in db
            await model.findByIdAndUpdate(req.params.id, { image: nameToStore });
            res.status(200).json({
                success: true,
                data: nameToStore
            })
        })

    };

module.exports = uploadImage;