const { error } = require("../utils/responseBuilder");

const validate = (schema) => {
    return (req, res, next) => {
console.log("BODY:", req.body);
console.log("PARAMS:", req.params);
console.log("QUERY:", req.query);        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query
        });
console.log("Validation result:", result);
        if (!result.success) {
            return res
    .status(400)
    .json(
        error(
            "Validation failed",
            result.error.issues
        )
    );
        }
console.log("Validation passed:", result.data);
        req.body = result.data.body || {};
        req.params = result.data.params || {};
        req.query = result.data.query || {};
console.log("Validated data set on req:", {
            body: req.body,
            params: req.params,
            query: req.query
        });
        next();
    };
};

module.exports = validate;