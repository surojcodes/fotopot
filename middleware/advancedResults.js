const advancedResults = (model, populate) => async (req, res, next) => {

    let reqQuery = { ...req.query };
    // remove SELECT from the query string
    let removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(field => delete reqQuery[field]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let query = model.find(JSON.parse(queryStr));

    //check if the query had select and present result accordingly
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    // SORTING
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }
    //PAGINATION
    const page = parseInt(req.query.page, 10) || 1; //how many pages
    const limit = parseInt(req.query.limit, 10) || 25;     //no of records in each page , by defualt 25
    const startIndex = (page - 1) * limit;
    const endIndex = (page * limit);
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);
    if (populate) {
        query = query.populate(populate);
    }
    // Run query
    const results = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }
    next();
}

module.exports = advancedResults;